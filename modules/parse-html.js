const headings = [
    'Tanggal',
    '#',
    'Pengirim Disposisi',
    'Tanggal',
    'Sifat Disposisi',
    'Catatan',
    'Keterangan Tambahan',
    'Petunjuk Disposisi',
    'Penerima Disposisi'
  ];

function parseHtml(id, $) {
  const data = {
    'id': id,
    'disposisi': []
  };
  $('#yw2, #yw3, #yw4').find('tr').each((i, tr) => {
    keyVal = hashTableRow(tr, $);
    data[keyVal.key] = keyVal.val;
  })
  $('#tab3 tbody tr').each((i, tr) => {
    disposisi = mapTableDisposisi(tr, $);
    if (disposisi) data.disposisi.push(disposisi);
  })
  return data;
}

function hashTableRow(tr, $) {
  const key = $(tr).children().first().text();
  const val = $(tr).children().last().text()
  return {key, val};
}

function mapTableDisposisi(tr, $) {
  let data = {};
  $(tr).children().each((i, td) => {
    if($(td).hasClass('empty')) return data = null;
    data[headings[i]] = $(td).text();
  })
  return data;
}

module.exports = parseHtml;