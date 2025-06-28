const db = require('../config/db');

function hitungTotalNilai(penilaianList) {
  const totalPenilai = penilaianList.length;

  return penilaianList.reduce((total, item) => {
    const nilai = [
      item.nilai_matriks_1,
      item.nilai_matriks_2,
      item.nilai_matriks_3,
      item.nilai_matriks_4,
      item.nilai_matriks_5,
      item.nilai_matriks_6,
      item.nilai_matriks_7,
    ].reduce((a, b) => a + (b || 0), 0);

    let bobot = 0;
    if (totalPenilai === 2) {
      bobot = 0.5;
    } else if (totalPenilai === 3) {
      bobot = item.keterangan_penilai === 'Kepala Departemen' ? 0.5 : 0.25;
    }

    return total + (nilai * bobot);
  }, 0);
}


exports.getStaff = (req, res) => {
  const sql = 'SELECT * FROM insevent ORDER BY Start_Date ASC';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getMatriks = (req, res) => {
  const sql = 'SELECT * FROM matriks_penilaian';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getNilai = (req, res) => {
  const { depart, month } = req.params;

  const sql = `
    SELECT keterangan_penilai, nama_anggota, nama_departemen, MONTHNAME(waktu) AS bulan, 
           waktu, anggota_id, penilai, 
           nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
           nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7
    FROM view_penilaian_anggota 
    WHERE nama_departemen = ?
      AND MONTH(waktu) = ? 
      AND YEAR(waktu) = YEAR(CURRENT_DATE())
    ORDER BY anggota_id, waktu
  `;

  db.query(sql, [depart, month], (err, rows) => {
    if (err) return res.status(500).send(err);

    const grouped = {};

    rows.forEach(row => {
      const key = row.anggota_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const finalResult = [];

    for (const anggotaId in grouped) {
      const penilaianList = grouped[anggotaId];

      // Hitung total nilai akhir berdasarkan bobot
      const totalPenilai = penilaianList.length;

      // Hitung rata-rata nilai per matriks
      const totalMatrix = {
        nilai_matriks_1: 0,
        nilai_matriks_2: 0,
        nilai_matriks_3: 0,
        nilai_matriks_4: 0,
        nilai_matriks_5: 0,
        nilai_matriks_6: 0,
        nilai_matriks_7: 0,
      };

      penilaianList.forEach(item => {
        totalMatrix.nilai_matriks_1 += item.nilai_matriks_1 || 0;
        totalMatrix.nilai_matriks_2 += item.nilai_matriks_2 || 0;
        totalMatrix.nilai_matriks_3 += item.nilai_matriks_3 || 0;
        totalMatrix.nilai_matriks_4 += item.nilai_matriks_4 || 0;
        totalMatrix.nilai_matriks_5 += item.nilai_matriks_5 || 0;
        totalMatrix.nilai_matriks_6 += item.nilai_matriks_6 || 0;
        totalMatrix.nilai_matriks_7 += item.nilai_matriks_7 || 0;
      });

      const rata2 = {};
      Object.entries(totalMatrix).forEach(([key, value]) => {
        rata2[key] = parseFloat((value / totalPenilai).toFixed(2));
      });

      finalResult.push({
        nama_anggota: penilaianList[0].nama_anggota,
        nama_departemen: penilaianList[0].nama_departemen,
        bulan: penilaianList[0].bulan,
        ...rata2,
        total_nilai: hitungTotalNilai(penilaianList),
        total_akhir: parseFloat(hitungTotalNilai(penilaianList)/35*100).toFixed(2),
      });
    }

    res.send(finalResult);
  });
};

exports.getNilaiByPenilai = (req, res) => {
  const { depart, month, penilai } = req.params;
  const sql = `SELECT nama_anggota, nama_departemen, MONTHNAME(waktu) AS bulan,
              nilai_matriks_1, 
              nilai_matriks_2, 
              nilai_matriks_3,
              nilai_matriks_4, 
              nilai_matriks_5, 
              nilai_matriks_6, 
              nilai_matriks_7, 
              id_detail_matriks_1, id_detail_matriks_2, id_detail_matriks_3,
              id_detail_matriks_4, id_detail_matriks_5,
              id_detail_matriks_6, id_detail_matriks_7, total_nilai 
              FROM view_penilaian_anggota WHERE nama_departemen = ?
              AND MONTH(waktu) = ? AND penilai = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())`;
  db.query(sql, [depart, month, penilai], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getAllNilai = (req, res) => {
  const { month } = req.params;
  const sql = `SELECT keterangan_penilai, nama_anggota, nama_departemen, MONTHNAME(waktu) AS bulan, 
           waktu, anggota_id, penilai, 
           nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
           nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7
    FROM view_penilaian_anggota 
    WHERE MONTH(waktu) = ? 
      AND YEAR(waktu) = YEAR(CURRENT_DATE())
    ORDER BY anggota_id, waktu`;
  db.query(sql, [month], (err, rows) => {
    if (err) return res.status(500).send(err);

    const grouped = {};

    rows.forEach(row => {
      const key = row.anggota_id;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const finalResult = [];

    for (const anggotaId in grouped) {
      const penilaianList = grouped[anggotaId];

      // Hitung total nilai akhir berdasarkan bobot
      const totalPenilai = penilaianList.length;

      // Hitung rata-rata nilai per matriks
      const totalMatrix = {
        nilai_matriks_1: 0,
        nilai_matriks_2: 0,
        nilai_matriks_3: 0,
        nilai_matriks_4: 0,
        nilai_matriks_5: 0,
        nilai_matriks_6: 0,
        nilai_matriks_7: 0,
      };

      penilaianList.forEach(item => {
        totalMatrix.nilai_matriks_1 += item.nilai_matriks_1 || 0;
        totalMatrix.nilai_matriks_2 += item.nilai_matriks_2 || 0;
        totalMatrix.nilai_matriks_3 += item.nilai_matriks_3 || 0;
        totalMatrix.nilai_matriks_4 += item.nilai_matriks_4 || 0;
        totalMatrix.nilai_matriks_5 += item.nilai_matriks_5 || 0;
        totalMatrix.nilai_matriks_6 += item.nilai_matriks_6 || 0;
        totalMatrix.nilai_matriks_7 += item.nilai_matriks_7 || 0;
      });

      const rata2 = {};
      Object.entries(totalMatrix).forEach(([key, value]) => {
        rata2[key] = parseFloat((value / totalPenilai).toFixed(2));
      });

      finalResult.push({
        nama_anggota: penilaianList[0].nama_anggota,
        nama_departemen: penilaianList[0].nama_departemen,
        bulan: penilaianList[0].bulan,
        ...rata2,
        total_nilai: hitungTotalNilai(penilaianList),
        total_akhir: parseFloat(hitungTotalNilai(penilaianList)/35*100).toFixed(2),
      });
    }

    res.send(finalResult);
  });
};

exports.getMaxNilai = (req, res) => {
  const { month } = req.params;
  const sql = `
    SELECT 
      nama_anggota,
      nama_departemen,
      MONTHNAME(waktu) AS waktu,
      waktu AS waktu_asli,
      anggota_id,
      keterangan_penilai,
      nilai_matriks_1,
      nilai_matriks_2,
      nilai_matriks_3,
      nilai_matriks_4,
      nilai_matriks_5,
      nilai_matriks_6,
      nilai_matriks_7
    FROM view_penilaian_anggota
    WHERE MONTH(waktu) = ? AND YEAR(waktu) = YEAR(CURRENT_DATE())
  `;

  db.query(sql, [month], (err, rows) => {
    if (err) return res.status(500).send(err);

    const grouped = {};

    rows.forEach(row => {
      const key = `${row.anggota_id}-${row.nama_departemen}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const nilaiPerAnggota = [];

    for (const key in grouped) {
      const list = grouped[key];
      const totalNilai = hitungTotalNilai(list);

      nilaiPerAnggota.push({
        nama_anggota: list[0].nama_anggota,
        nama_departemen: list[0].nama_departemen,
        waktu: list[0].waktu,
        total_nilai: parseFloat(totalNilai.toFixed(2)),
      });
    }

    // Cari max nilai per departemen
    const maxPerDepartemen = {};
    nilaiPerAnggota.forEach(item => {
      const depart = item.nama_departemen;
      if (!maxPerDepartemen[depart] || item.total_nilai > maxPerDepartemen[depart].total_nilai) {
        maxPerDepartemen[depart] = item;
      }
    });

    res.send(Object.values(maxPerDepartemen));
  });
};

exports.getLineChart = (req, res) => {
  const sql = `
    SELECT 
      DATE_FORMAT(waktu, '%Y-%m') AS bulan,
      anggota_id,
      nama_anggota,
      keterangan_penilai,
      nilai_matriks_1,
      nilai_matriks_2,
      nilai_matriks_3,
      nilai_matriks_4,
      nilai_matriks_5,
      nilai_matriks_6,
      nilai_matriks_7
    FROM view_penilaian_anggota
    WHERE YEAR(waktu) = YEAR(CURRENT_DATE())
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send(err);

    // Grup berdasarkan bulan + anggota_id
    const grouped = {};

    rows.forEach(row => {
      const key = `${row.bulan}-${row.anggota_id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    // Hitung nilai total per anggota per bulan
    const nilaiPerOrang = [];
    for (const key in grouped) {
      const list = grouped[key];
      const total_nilai = hitungTotalNilai(list);
      nilaiPerOrang.push({
        bulan: list[0].bulan,
        total_nilai,
      });
    }

    // Hitung rata-rata per bulan
    const perBulan = {};
    nilaiPerOrang.forEach(item => {
      if (!perBulan[item.bulan]) perBulan[item.bulan] = [];
      perBulan[item.bulan].push(item.total_nilai);
    });

    const result = Object.entries(perBulan).map(([bulan, nilaiList]) => {
      const avg = nilaiList.reduce((a, b) => a + b, 0) / nilaiList.length;
      return {
        bulan,
        total_nilai: (parseFloat(avg.toFixed(2))/35*100).toFixed(2),
      };
    });

    res.send(result.sort((a, b) => a.bulan.localeCompare(b.bulan)));
  });
};

exports.getLineChart2 = (req, res) => {
  const { depart } = req.params;

  const sql = `
    SELECT keterangan_penilai, nama_departemen, date_format(waktu, '%Y-%m') AS bulan,
           anggota_id,
           nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
           nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7
    FROM view_penilaian_anggota
    WHERE nama_departemen = ?
      AND YEAR(waktu) = YEAR(CURRENT_DATE())
  `;

  db.query(sql, [depart], (err, rows) => {
    if (err) return res.status(500).send(err);

    const grouped = {};

    rows.forEach(row => {
      const key = `${row.nama_departemen}-${row.bulan}-${row.anggota_id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const departBulanMap = {};

    for (const key in grouped) {
      const penilaianList = grouped[key]; 
      const totalNilai = hitungTotalNilai(penilaianList);

      const bulan = penilaianList[0].bulan;
      const departemen = penilaianList[0].nama_departemen;

      const groupKey = `${departemen}-${bulan}`;
      if (!departBulanMap[groupKey]) {
        departBulanMap[groupKey] = {
          nama_departemen: departemen,
          bulan: bulan,
          total_nilai: 0,
          anggota_set: new Set()
        };
      }

      departBulanMap[groupKey].total_nilai += totalNilai;
      departBulanMap[groupKey].anggota_set.add(penilaianList[0].anggota_id);
    }

    const result = Object.values(departBulanMap).map(item => {
        const jumlahAnggota = item.anggota_set.size;
        const rataRataNilai = jumlahAnggota > 0 ? item.total_nilai / jumlahAnggota : 0;
        return {
          nama_departemen: item.nama_departemen,
          bulan: item.bulan,
          total_nilai: parseFloat(parseFloat(rataRataNilai.toFixed(2))/35*100).toFixed(2),
        };
    });
    res.send(result);
  });
};

exports.getPersonalLineChart = (req, res) => {
  const nama = req.user.username;
  const sql = `SELECT keterangan_penilai, nama_anggota, nama_departemen, MONTHNAME(waktu) AS bulan, 
              waktu, anggota_id, penilai, 
              nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
              nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7
              FROM view_penilaian_anggota 
              WHERE YEAR(waktu) = YEAR(CURRENT_DATE()) AND nama_anggota = ?
              ORDER BY anggota_id, waktu`;
  db.query(sql, [nama], (err, rows) => {
    const grouped = {};

    rows.forEach(row => {
      const key = `${row.nama_departemen}-${row.bulan}-${row.anggota_id}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const departBulanMap = {};

    for (const key in grouped) {
      const penilaianList = grouped[key]; 
      const totalNilai = hitungTotalNilai(penilaianList);

      const bulan = penilaianList[0].bulan;
      const departemen = penilaianList[0].nama_departemen;

      const groupKey = `${departemen}-${bulan}`;
      if (!departBulanMap[groupKey]) {
        departBulanMap[groupKey] = {
          nama_departemen: departemen,
          bulan: bulan,
          total_nilai: 0,
          anggota_set: new Set()
        };
      }

      departBulanMap[groupKey].total_nilai += totalNilai;
      departBulanMap[groupKey].anggota_set.add(penilaianList[0].anggota_id);
    }

    const result = Object.values(departBulanMap).map(item => {
        const jumlahAnggota = item.anggota_set.size;
        const rataRataNilai = jumlahAnggota > 0 ? item.total_nilai / jumlahAnggota : 0;
        return {
          nama_departemen: item.nama_departemen,
          bulan: item.bulan,
          total_nilai: parseFloat(parseFloat(rataRataNilai.toFixed(2))/35*100).toFixed(2),
        };
    });

    res.send(result);
  });
};

exports.getPersonalNilai = (req, res) => {
  const nama = req.user.username;
  const sql = `SELECT keterangan_penilai, nama_anggota, nama_departemen, MONTHNAME(waktu) AS bulan, 
              waktu, anggota_id, penilai, 
              nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
              nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7
              FROM view_penilaian_anggota 
              WHERE YEAR(waktu) = YEAR(CURRENT_DATE()) AND nama_anggota = ?
              ORDER BY anggota_id, waktu
              `;
  db.query(sql, [nama], (err, rows) => {
    if (err) return res.status(500).send(err);
    const grouped = {};

    rows.forEach(row => {
      const key = `${row.anggota_id}-${row.bulan}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(row);
    });

    const finalResult = [];

    for (const anggotaId in grouped) {
      const penilaianList = grouped[anggotaId];

      // Hitung total nilai akhir berdasarkan bobot
      const totalPenilai = penilaianList.length;

      // Hitung rata-rata nilai per matriks
      const totalMatrix = {
        nilai_matriks_1: 0,
        nilai_matriks_2: 0,
        nilai_matriks_3: 0,
        nilai_matriks_4: 0,
        nilai_matriks_5: 0,
        nilai_matriks_6: 0,
        nilai_matriks_7: 0,
      };

      penilaianList.forEach(item => {
        totalMatrix.nilai_matriks_1 += item.nilai_matriks_1 || 0;
        totalMatrix.nilai_matriks_2 += item.nilai_matriks_2 || 0;
        totalMatrix.nilai_matriks_3 += item.nilai_matriks_3 || 0;
        totalMatrix.nilai_matriks_4 += item.nilai_matriks_4 || 0;
        totalMatrix.nilai_matriks_5 += item.nilai_matriks_5 || 0;
        totalMatrix.nilai_matriks_6 += item.nilai_matriks_6 || 0;
        totalMatrix.nilai_matriks_7 += item.nilai_matriks_7 || 0;
      });

      const rata2 = {};
      Object.entries(totalMatrix).forEach(([key, value]) => {
        rata2[key] = parseFloat((value / totalPenilai).toFixed(2));
      });

      const totalSemuaMatriks = Object.values(rata2).reduce((a, b) => a + b, 0);
      if (totalSemuaMatriks === 0) continue;

      finalResult.push({
        nama_anggota: penilaianList[0].nama_anggota,
        nama_departemen: penilaianList[0].nama_departemen,
        bulan: penilaianList[0].bulan,
        ...rata2,
        total_nilai: hitungTotalNilai(penilaianList),
        total_akhir: parseFloat(hitungTotalNilai(penilaianList)/35*100).toFixed(2),
      });
    }

    res.send(finalResult);
  });
};

exports.getRadarChart = (req, res) => {
  const { depart } = req.params;
  const sql = `SELECT * FROM vw_penilaian_anggota_per_departemen WHERE nama_departemen = ? ORDER BY rata_rata DESC LIMIT 5`;
  db.query(sql, [depart], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getPersonalRadarChart = (req, res) => {
  const nama = req.user.username;
  const sql = `SELECT * FROM vw_penilaian_anggota_per_departemen WHERE nama_anggota = ?`;
  db.query(sql, [nama], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.getBarChart = (req, res) => {
  const { depart } = req.params;
  const sql = `SELECT
              nama_anggota, nama_departemen,
              nilai_matriks_1, nilai_matriks_2, nilai_matriks_3,
              nilai_matriks_4, nilai_matriks_5, nilai_matriks_6, nilai_matriks_7, total_nilai FROM view_penilaian_anggota WHERE nama_departemen = ? 
              AND MONTH(waktu) = MONTH(CURRENT_DATE()) AND YEAR(waktu) = YEAR(CURRENT_DATE())`;
  db.query(sql, [depart], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send(result);
  });
};

exports.updateNilai = (req, res) => {
  const { id, nilai } = req.body;

  // Validasi input
  if (!id || typeof nilai === 'undefined') {
    return res.status(400).json({ error: "ID dan nilai diperlukan" });
  }

  const sql = "UPDATE detail_penilaian SET nilai = ? WHERE id_detail_penilaian = ?";

  db.query(sql, [nilai, id], (err, result) => {
    if (err) {
      console.error("❌ Gagal update nilai:", err);
      return res.status(500).json({ error: "Gagal update nilai" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "ID tidak ditemukan" });
    }

    res.status(200).json({ message: "✅ Nilai berhasil diperbarui" });
  });
};

exports.addMatriks = async (req, res) => {
    const {  nama_matriks, bobot } = req.body;
  
    try {
      // Cek apakah user sudah ada
      const sqlCheck = "SELECT * FROM matriks_penilaian WHERE nama = ?";
      db.query(sqlCheck, [nama_matriks], async (err, result) => {
        if (err) {
          console.error("DB Error:", err); // Menampilkan error DB ke console
          return res.status(500).json({ message: "Gagal memeriksa matriks" });
        }
  
        if (result.length > 0) {
          return res.status(400).json({ message: "Matriks sudah terdaftar" });
        }

        const sqlInsert = "INSERT INTO matriks_penilaian ( nama, bobot ) VALUES ( ?, ? )";
        db.query(sqlInsert, [ nama_matriks, bobot ], (err, result) => {
          if (err) {
            console.error("DB Error:", err); // Menampilkan error DB ke console
            return res.status(500).json({ message: "Gagal menyimpan matriks" });
          }
  
          res.status(201).json({ message: "Tambah Matriks berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error); // Log error yang tidak terduga
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };  

  // STORE ROLE 
  exports.storeMatriks = async (req, res) => {
    const { id } = req.params;
    const sqlFind = "SELECT * FROM matriks_penilaian WHERE id_matriks = ?";
    db.query(sqlFind, [id], (err, rows) => {
      if (err) return res.status(500).json({ message: err.message });
      if (rows.length === 0)
        return res.status(404).json({ message: "Matrik tidak ditemukan" });

      res.json(rows[0]); 
    });
  };

  // UPDATE ROLE 
  exports.updateMatriks = async (req, res) => {
    const { id, nama, bobot } = req.body;

    try {
      // Cek apakah role dengan id itu ada
      const sqlFind = "SELECT * FROM matriks_penilaian WHERE id_matriks = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa matriks" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Matriks tidak ditemukan" });
        }

        // Update
        const sqlUpdate = "UPDATE matriks_penilaian SET nama = ?, bobot = ? WHERE id_matriks = ?";
        db.query(sqlUpdate, [nama, bobot, id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal mengubah matriks" });
          }
          res.json({ message: "Update Matriks berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

  // DELETE ROLE
  exports.deleteMatriks = async (req, res) => {
    const { id } = req.params;       

    try {
      const sqlFind = "SELECT * FROM matriks_penilaian WHERE id_matriks = ?";
      db.query(sqlFind, [id], (err, rows) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "Gagal memeriksa matriks" });
        }
        if (rows.length === 0) {
          return res.status(404).json({ message: "Matriks tidak ditemukan" });
        }

        // Hapus
        const sqlDelete = "DELETE FROM matriks_penilaian WHERE id_matriks = ?";
        db.query(sqlDelete, [id], (err) => {
          if (err) {
            console.error("DB Error:", err);
            return res.status(500).json({ message: "Gagal menghapus matriks" });
          }
          res.json({ message: "Hapus Matriks berhasil!" });
        });
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };