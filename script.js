$(document).ready(() => {
    // console.log($('.hasilGenerate').text());
    $('#example').DataTable({
        ajax: {
            url: 'http://localhost:1880/getRecord',
            dataSrc: '',
            method: "GET",
        },
        columns: [{
            data: null,
            render: (data, type, row, meta) => {
                return meta.row + 1
            }
        },
        {
            data: "namaBarang"
        },
        {
            data: "kodeBarang"
        },
        {
            data: "berat"
        },
        {
            data: null,
            render: (data, type, row, meta) => {
                return `
                    <button type="button" id="edit" data-id=${data.ID} data-toggle="modal" data-target="#exampleModal" onclick="findById(${data.ID})">
                    Edit
                    </button>
                    <button type="button" id="hapus" class="hapus" onclick="deleteById(${data.ID})">
                    Delete
                    </button>
                `
            }
        }
    ]
    });

    var awalkode = $("#inputKode").val()
    var awalnama = $("#inputNama").val()
   

    // console.log($("#inputKode").val() == awalkode)
    // console.log($("#inputNama").val() == awalnama)
    var generation = false;
    var generationEdit = false;
    var ws;
    $("#random").click(function () {
        $("#stop").removeAttr('hidden');
        $("#random").attr('hidden', true)
        console.log("generation rand" + generation)
        $(".hasilGenerate").attr('id', 'hasilGenerate');
        ws = new WebSocket('ws://localhost:1880/acak');
        let wsFunc = () => {
            ws.onopen = (e) => {
                console.log("Start Generate")
            }
            ws.onmessage = (e) => {
                $("#hasilGenerate").text(`${e.data}`);
            }

            ws.onclose = (e) => {

            }
        }
        wsFunc();
    })

    $("#stop").click(() => {
        $("#random").removeAttr('hidden');
        $("#stop").attr('hidden', true);
        generation = true;
        console.log("generation stop " + generation)
        // ws.close();
        $("#hasilGenerate").removeAttr('id');
    })

    console.log("generation luar " + generation)
    $("#record-btn").click((e) => {
        console.log("generation " + generation)
        if (generation == false) {
            
            Swal.fire(
                'Anda harus Generate dan Stop Generate','', 'info'
              )
        } else if ($("#inputKode").val() == awalkode || $("#inputNama").val() == awalnama) {
            Swal.fire("Masukin nilainya semua dong");
        } else {
            var data = {
                kodeBarang: $("#inputKode").val(),
                namaBarang: $("#inputNama").val(),
                berat: $(".hasilGenerate").text()
            }
            Swal.fire({
                title: 'Yakin save datanya?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: 'Save',
                denyButtonText: `Don't save`,
              }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    $.post("http://localhost:1880/record", data, (res, textStatus) => {
                            Swal.fire('Saved!', '', 'success')
                            .then(function(isConfirm) {
                                if (isConfirm) {
                                    location.reload();
                                } else {
                                //if no clicked => do something else
                                }
                            });
                        }).fail((data, textStatus, xhr) => {
                            data.status == 500 ? Swal.fire("Ada yang salah nih") :
                                data.status == 417 ? Swal.fire("Kode barang jangan Sama gitu ah!") :
                                console.log(typeof (status), status);
                        })
                  
                } else if (result.isDenied) {
                  Swal.fire('Changes are not saved', '', 'info')
                }
            })
            
        }
    })
    
    $("#saveUpdate").click((res)=>{
        res.preventDefault()
        if (generationEdit == true) {
            Swal.fire(
                'Anda harus Generate dan Stop Generate','', 'info'
              )
        }else if($("#editKode").val() == "" || $("#editNama").val() == ""){
            Swal.fire("Jangan dikosongin!! Ada Mixue");
        } else{
            Swal.fire({
                title: 'Yakin save datanya?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Save',
                denyButtonText: `Don't save`,
              }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    $.ajax({
                        method: "PUT",
                        url: "http://localhost:1880/update/"+ $("#editId").val(),
                        dataType: "JSON",
                        contentType: "application/json",
                        data: JSON.stringify({
                            kodeBarang: $("#editKode").val(),
                            namaBarang: $("#editNama").val(),
                            berat: $(".editGenerate").text()
                        }),
                        success: (result) => {
                            Swal.fire({
                                position: 'center',
                                icon: 'success',
                                title: 'Region has been Updated',
                                confirmButtonText: 'Ok'
                            }).then((data, textStatus) => {
                                location.reload()
                            })
                        },
                        error : (data, textStatus, xhr) => {
                            data.status == 500 ? Swal.fire("Ada yang salah nih") :
                            data.status == 417 ? Swal.fire("Ubah Datanya dan Jangan sampai Duplikat!", "", "warning") :
                            console.log(typeof (status), status);
                        }

                        
                    })
                  
                } else if (result.isDenied) {
                  Swal.fire('Changes are not saved', '', 'info')
                }
            })
        }
    })

    $("#editRandom").click(function () {
        generationEdit=true;
        $("#editStop").removeAttr('hidden');
        $("#editRandom").attr('hidden', true)
        $(".editGenerate").attr('id', 'editGenerate');
        ws = new WebSocket('ws://localhost:1880/acak');
        let wsFunc = () => {
            ws.onopen = (e) => {
                console.log("Start Generate")
            }
            ws.onmessage = (e) => {
                $("#editGenerate").text(`${e.data}`);
            }

            ws.onclose = (e) => {

            }
        }
        wsFunc();
    })
    $("#editStop").click(() => {
        generationEdit=false;
        $("#editRandom").removeAttr('hidden');
        $("#editStop").attr('hidden', true);
        generation = true;
        // ws.close();
        $("#editGenerate").removeAttr('id');
    })
})


function findById(id) {
    
    $.get("http://localhost:1880/edit/" + id, function (res) {
                console.log(res[0])
                $("#editId").val(res[0].ID);
                $("#exampleModalLabel").text(`ubah data id ${res[0].ID}`)
                $("#editNama").val(res[0].namaBarang);
                $("#editKode").val(res[0].kodeBarang);
                $(".editGenerate").text(parseFloat(res[0].berat));
    })
    
}

function deleteById(id) {
      
      Swal.fire({
        title: 'Yakin nih mau delete datanya?',
        showDenyButton: true,
        confirmButtonText: 'Delete',
        denyButtonText: `Don't delete`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire('Delete!', '', 'success')
          .then(function(isConfirm) {
            if (isConfirm) {
                $.ajax({
                    method: "DELETE",
                    url: "http://localhost:1880/delete/" + id,
                    dataType: "json",
                    dataSrc: "",
                    success: (result) => {
                        location.reload();
                    }
                })
            } else {
              //if no clicked => do something else
            }
          });
        } else if (result.isDenied) {
          Swal.fire('Oke Gajadi Didelete', '', 'info')
        }
    })
}