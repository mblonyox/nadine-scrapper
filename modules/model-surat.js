const mongoose = require('mongoose');
const moment = require('moment');

function formatTgl(tgl) {
  return moment(tgl, 'DD-MM-YYYY')
}

module.exports = mongoose.model('Surat',  new mongoose.Schema({
  id: {type: Number, index: true},
  disposisi: [{
    Tanggal: {type: Date, set: formatTgl},
    '#': Number,
    'Pengirim Disposisi': String,
    'Sifat Disposisi': String,
    Catatan: String,
    'Keterangan Tambahan': String,
    'Petunjuk Disposisi': String,
    'Penerima Disposisi': String
  }],
  'No Agenda': String,
  'No Naskah Dinas': String,
  'Tgl Naskah Dinas': {type: Date, set: formatTgl},
  'Tgl Diterima': {type: Date, set: formatTgl},
  'Sifat Naskah Dinas': String,
  'Status Berkas': String,
  'Jenis Naskah Dinas': String,
  Lampiran: String,
  Perihal: String,
  'Jenis Unit Pengirim': String,
  'Unit Pengirim': String,
  'Nama Pengirim': String,
  'Alamat Pengirim': String,
  Alur: String,
  'Unit Tujuan': String,
  'Unit Diajukan': String
}));