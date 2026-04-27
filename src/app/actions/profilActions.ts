"use server";
import db from "@/lib/db";
import { executeQuery } from "@/lib/dbHelper";
import { revalidatePath } from "next/cache";

export interface Profil {
  id: number;
  Namalkp: string;
  Alamat: string;
  Kelurahan: string;
  Kecamatan: string;
  Kota: string;
  Provinsi: string;
  Rt: string;
  Rw: string;
  Kodepos: string;
  Namayayasan: string;
  Telepon: string;
  Nofax: string;
  Email: string;
  Npsn: string;
  Website: string;
  Logo: string;
  Warna_Primary: string;
  Kepala: string;
  NIP_Kepala: string;
}

export async function getProfil(): Promise<Profil | null> {
  try {
    const rows = await db.query("SELECT * FROM profil ORDER BY id DESC LIMIT 1") as any;
    const result = rows[0] as Profil[];
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateProfil(data: Partial<Profil>) {
  try {
    const existing = await getProfil();
    
    if (existing) {
      await db.query(
        `UPDATE profil SET 
          Namalkp = ?, Alamat = ?, Kelurahan = ?, Kecamatan = ?, Kota = ?, 
          Provinsi = ?, Rt = ?, Rw = ?, Kodepos = ?, Namayayasan = ?, 
          Telepon = ?, Nofax = ?, Email = ?, Npsn = ?, Website = ?, 
          Logo = ?, Warna_Primary = ?, Kepala = ?, NIP_Kepala = ? 
         WHERE id = ?`,
        [
          data.Namalkp, data.Alamat, data.Kelurahan, data.Kecamatan, data.Kota,
          data.Provinsi, data.Rt, data.Rw, data.Kodepos, data.Namayayasan,
          data.Telepon, data.Nofax, data.Email, data.Npsn, data.Website,
          data.Logo, data.Warna_Primary, data.Kepala, data.NIP_Kepala, existing.id
        ]
      );
    } else {
      await db.query(
        `INSERT INTO profil 
          (Namalkp, Alamat, Kelurahan, Kecamatan, Kota, Provinsi, Rt, Rw, Kodepos, 
           Namayayasan, Telepon, Nofax, Email, Npsn, Website, Logo, Warna_Primary, Kepala, NIP_Kepala) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.Namalkp, data.Alamat, data.Kelurahan, data.Kecamatan, data.Kota,
          data.Provinsi, data.Rt, data.Rw, data.Kodepos, data.Namayayasan,
          data.Telepon, data.Nofax, data.Email, data.Npsn, data.Website,
          data.Logo, data.Warna_Primary, data.Kepala, data.NIP_Kepala
        ]
      );
    }
    
    revalidatePath("/institution-profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}