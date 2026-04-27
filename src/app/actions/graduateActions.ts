"use server";
import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface Graduate {
  Id: number;
  Nipd: number;
  Tgllulus: string;
  Tglcetak: string;
  Instruktur: number;
  n1: string;
  n2: string;
  n3: string;
  n4: string;
  n5: string;
  // Joins
  NamaPeserta?: string;
  Ttl?: string;
  Tglmasuk?: string;
  NamaInstruktur?: string;
  NamaRombel?: string;
  Uk1?: string; Uk2?: string; Uk3?: string; Uk4?: string; Uk5?: string;
  Jp1?: string; Jp2?: string; Jp3?: string; Jp4?: string; Jp5?: string;
}

export interface EligibleStudent {
  Nipd: number;
  Nama: string;
  NamaRombel: string | null;
  Jeniskursus: number;
  Uk1: string | null;
  Uk2: string | null;
  Uk3: string | null;
  Uk4: string | null;
  Uk5: string | null;
}

export async function getGraduates(): Promise<Graduate[]> {
  try {
    const query = `
      SELECT 
        l.*, 
        p.Nama as NamaPeserta,
        p.Ttl,
        p.Tglmasuk,
        i.NamaInstruktur,
        r.Namarombel as NamaRombel,
        uk.Uk1, uk.Uk2, uk.Uk3, uk.Uk4, uk.Uk5,
        uk.Jp1, uk.Jp2, uk.Jp3, uk.Jp4, uk.Jp5
      FROM lulusan l
      LEFT JOIN peserta p ON l.Nipd = p.Nipd
      LEFT JOIN instruktur i ON l.Instruktur = i.Id
      LEFT JOIN rombel r ON p.Jeniskursus = r.Id
      LEFT JOIN unitkompetensi uk ON p.Jeniskursus = uk.Rombel
      ORDER BY l.Id DESC
    `;
    const [rows] = await db.query(query);
    return rows as Graduate[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

/** Siswa dengan Status=2 (lulus) yang belum ada di tabel lulusan */
export async function getEligibleStudents(): Promise<EligibleStudent[]> {
  try {
    const query = `
      SELECT 
        p.Nipd, p.Nama,
        r.Namarombel AS NamaRombel,
        p.Jeniskursus,
        uk.Uk1, uk.Uk2, uk.Uk3, uk.Uk4, uk.Uk5
      FROM peserta p
      LEFT JOIN rombel r ON p.Jeniskursus = r.Id
      LEFT JOIN unitkompetensi uk ON p.Jeniskursus = uk.Rombel
      WHERE p.Status = 2
        AND p.Nipd NOT IN (SELECT Nipd FROM lulusan)
      ORDER BY p.Nama ASC
    `;
    const [rows] = await db.query(query);
    return rows as EligibleStudent[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addGraduate(data: {
  nipd: number;
  instrukturId: number;
  tgllulus: string;
  tglcetak: string;
  n1: string; n2: string; n3: string; n4: string; n5: string;
}) {
  try {
    await db.query(
      "INSERT INTO lulusan (Nipd, Instruktur, Tgllulus, Tglcetak, n1, n2, n3, n4, n5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [data.nipd, data.instrukturId, data.tgllulus, data.tglcetak, data.n1, data.n2, data.n3, data.n4, data.n5]
    );
    revalidatePath("/graduates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateGraduate(id: number, data: Partial<Graduate>) {
  try {
    await db.query(
      "UPDATE lulusan SET Tglcetak=?, n1=?, n2=?, n3=?, n4=?, n5=? WHERE Id=?",
      [data.Tglcetak, data.n1, data.n2, data.n3, data.n4, data.n5, id]
    );
    revalidatePath("/graduates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
