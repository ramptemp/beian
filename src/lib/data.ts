import { getDb } from './db';

export interface BeianRecord {
  id: number;
  name: string;
  domain: string | null;
  description: string | null;
  owner_name: string | null;
  owner_dept: string | null;
  owner_contact: string | null;
  status: string;
  beian_no: string | null;
  beian_date: string | null;
  server_info: string | null;
  db_type: string | null;
  tech_stack: string | null;
  security_level: string | null;
  vendor: string | null;
  tech_contact: string | null;
  tech_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getAllBeian(): BeianRecord[] {
  const db = getDb();
  return db.prepare('SELECT * FROM beian_records ORDER BY created_at DESC').all() as BeianRecord[];
}

export function getBeianPage(page: number, pageSize: number): { records: BeianRecord[]; total: number } {
  const db = getDb();
  const offset = (page - 1) * pageSize;
  const records = db.prepare('SELECT * FROM beian_records ORDER BY created_at DESC LIMIT ? OFFSET ?').all(pageSize, offset) as BeianRecord[];
  const countResult = db.prepare('SELECT COUNT(*) as total FROM beian_records').get() as { total: number };
  return { records, total: countResult.total };
}

export function getBeianById(id: number): BeianRecord | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM beian_records WHERE id = ?').get(id) as BeianRecord | undefined;
}

function generateBeianNo(db: ReturnType<typeof getDb>, year?: number): string {
  const y = year || new Date().getFullYear();
  const prefix = `ICP-${y}-`;
  const rows = db.prepare(`SELECT beian_no FROM beian_records WHERE beian_no LIKE ?`).all(`${prefix}%`) as { beian_no: string }[];
  let max = 0;
  for (const row of rows) {
    const match = row.beian_no.match(/-(\d{4})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }
  return `${prefix}${String(max + 1).padStart(4, '0')}`;
}

export function createBeian(data: Omit<BeianRecord, 'id' | 'created_at' | 'updated_at'>): number {
  const db = getDb();
  const beianNo = data.beian_no?.trim() || generateBeianNo(db);
  const result = db.prepare(`
    INSERT INTO beian_records (name, domain, description, owner_name, owner_dept, owner_contact, status, beian_no, beian_date, server_info, db_type, tech_stack, security_level, vendor, tech_contact, tech_phone, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.name, data.domain || null, data.description || null, data.owner_name || null,
    data.owner_dept || null, data.owner_contact || null, data.status || '未备案',
    beianNo, data.beian_date || null, data.server_info || null,
    data.db_type || null, data.tech_stack || null, data.security_level || null,
    data.vendor || null, data.tech_contact || null, data.tech_phone || null, data.notes || null
  );
  return Number(result.lastInsertRowid);
}

export function batchCreateBeian(dataList: Omit<BeianRecord, 'id' | 'created_at' | 'updated_at'>[]): number {
  const db = getDb();
  let nextNo = generateBeianNo(db);
  const insert = db.prepare(`
    INSERT INTO beian_records (name, domain, description, owner_name, owner_dept, owner_contact, status, beian_no, beian_date, server_info, db_type, tech_stack, security_level, vendor, tech_contact, tech_phone, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertMany = db.transaction((items: typeof dataList) => {
    for (const item of items) {
      const beianNo = item.beian_no?.trim() || nextNo;
      if (!item.beian_no?.trim()) {
        const match = nextNo.match(/-(\d{4})$/);
        if (match) {
          nextNo = nextNo.replace(/\d{4}$/, String(parseInt(match[1], 10) + 1).padStart(4, '0'));
        }
      }
      insert.run(
        item.name, item.domain || null, item.description || null, item.owner_name || null,
        item.owner_dept || null, item.owner_contact || null, item.status || '未备案',
        beianNo, item.beian_date || null, item.server_info || null,
        item.db_type || null, item.tech_stack || null, item.security_level || null,
        item.vendor || null, item.tech_contact || null, item.tech_phone || null, item.notes || null
      );
    }
  });
  insertMany(dataList);
  return dataList.length;
}

export function updateBeian(id: number, data: Partial<BeianRecord>): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return;

  values.push(id);
  db.prepare(`UPDATE beian_records SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
}

export function deleteBeian(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM beian_records WHERE id = ?').run(id);
}

export function batchDeleteBeian(ids: number[]): { deleted: number } {
  const db = getDb();
  const stmt = db.prepare('DELETE FROM beian_records WHERE id = ?');
  const delMany = db.transaction((items: number[]) => {
    for (const id of items) {
      stmt.run(id);
    }
  });
  delMany(ids);
  return { deleted: ids.length };
}

export interface Server {
  id: number;
  beian_id: number;
  ip_address: string;
  os: string | null;
  middleware: string | null;
  db_type: string | null;
  cpu_memory: string | null;
  disk: string | null;
  location: string | null;
  purpose: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function getServersByBeianId(beianId: number): Server[] {
  const db = getDb();
  return db.prepare('SELECT * FROM servers WHERE beian_id = ? ORDER BY created_at DESC').all(beianId) as Server[];
}

export function getServerById(id: number): Server | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM servers WHERE id = ?').get(id) as Server | undefined;
}

export function getAllServers(): (Server & { system_name: string })[] {
  return searchServers();
}

export function searchServers(
  ip?: string,
  beianId?: number,
  os?: string,
  middleware?: string,
  dbType?: string,
  location?: string
): (Server & { system_name: string })[] {
  const db = getDb();
  let sql = `
    SELECT s.*, b.name as system_name
    FROM servers s
    JOIN beian_records b ON s.beian_id = b.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];
  if (ip) {
    sql += ' AND s.ip_address LIKE ?';
    params.push(`%${ip}%`);
  }
  if (beianId) {
    sql += ' AND s.beian_id = ?';
    params.push(beianId);
  }
  if (os) {
    sql += ' AND s.os LIKE ?';
    params.push(`%${os}%`);
  }
  if (middleware) {
    sql += ' AND s.middleware LIKE ?';
    params.push(`%${middleware}%`);
  }
  if (dbType) {
    sql += ' AND s.db_type LIKE ?';
    params.push(`%${dbType}%`);
  }
  if (location) {
    sql += ' AND s.location LIKE ?';
    params.push(`%${location}%`);
  }
  sql += ' ORDER BY s.created_at DESC';
  return db.prepare(sql).all(...params) as (Server & { system_name: string })[];
}

export function createServer(data: Omit<Server, 'id' | 'created_at' | 'updated_at'>): number {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO servers (beian_id, ip_address, os, middleware, db_type, cpu_memory, disk, location, purpose, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    data.beian_id, data.ip_address, data.os || null, data.middleware || null,
    data.db_type || null, data.cpu_memory || null, data.disk || null,
    data.location || null, data.purpose || null, data.notes || null
  );
  return Number(result.lastInsertRowid);
}

export function updateServer(id: number, data: Partial<Server>): void {
  const db = getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length === 0) return;

  values.push(id);
  db.prepare(`UPDATE servers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
}

export function deleteServer(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM servers WHERE id = ?').run(id);
}

export function batchCreateServers(dataList: (Omit<Server, 'id' | 'created_at' | 'updated_at' | 'beian_id'> & { system_name: string })[]): { imported: number; skipped: string[] } {
  const db = getDb();
  const systems = db.prepare('SELECT id, name FROM beian_records').all() as { id: number; name: string }[];
  const nameToId = new Map(systems.map((s) => [s.name, s.id]));

  const insert = db.prepare(`
    INSERT INTO servers (beian_id, ip_address, os, middleware, db_type, cpu_memory, disk, location, purpose, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const skipped: string[] = [];
  const toInsert: Server[] = [];

  for (const item of dataList) {
    const beianId = nameToId.get(item.system_name);
    if (!beianId) {
      skipped.push(item.system_name);
      continue;
    }
    toInsert.push({
      ...item,
      beian_id: beianId,
    } as Server);
  }

  const insertMany = db.transaction((items: Server[]) => {
    for (const item of items) {
      insert.run(
        item.beian_id, item.ip_address, item.os || null, item.middleware || null,
        item.db_type || null, item.cpu_memory || null, item.disk || null,
        item.location || null, item.purpose || null, item.notes || null
      );
    }
  });

  insertMany(toInsert);
  return { imported: toInsert.length, skipped };
}

export function verifyAdmin(username: string, password: string): boolean {
  const db = getDb();
  const bcrypt = require('bcryptjs');
  const admin = db.prepare('SELECT password_hash FROM admins WHERE username = ?').get(username) as { password_hash: string } | undefined;
  if (!admin) return false;
  return bcrypt.compareSync(password, admin.password_hash);
}

export function updateAdminPassword(username: string, newPassword: string): void {
  const db = getDb();
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE username = ?').run(hash, username);
}
