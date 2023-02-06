$(document).ready(() => {
    // console.log($('.hasilGenerate').text());
    $('#example').DataTable({
        ordering : false,
        searching : false
    });
    let awalkode = $("#inputKode").val()
    let awalnama = $("#inputNama").val()
    // $('#table_id').DataTable();
    $.get('http://localhost:1880/getRecord', (res) => {
        res.forEach(i => {
            $("#table-contain").append(`
            <tr>
                <td>${i.ID}</td>
                <td>${i.namaBarang}</td>
                <td>${i.kodeBarang}</td>
                <td>${i.berat}</td>
                <td>
                    <button type="button" id="edit" data-id=${i.ID} data-toggle="modal" data-target="#exampleModal" onclick=findById(${i.ID})>
                        Ubah
                    </button>

                    <button id="hapus" data-id=${i.ID} class="hapus" onclick=deleteById(${i.ID})>
                        Hapus
                    </button>
                </td>
            </tr>

            
            `)
        });
        
        // console.log(res[0].namaBarang);
    })

    

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
                'Anda harus Stop Generate',
              )
        } else if ($("#inputKode").val() == awalkode || $("#inputNama").val() == awalnama) {
            Swal.fire("Masukin nilainya semua dong");
        } else {
            var data = {
                kodeBarang: $("#inputKode").val(),
                namaBarang: $("#inputNama").val(),
                berat: $(".hasilGenerate").text()
            }
            $.post("http://localhost:1880/record", data, (res, textStatus) => {
                Swal.fire("Ciyee berhasil!", 'success')
                location.reload()
            }).fail((data, textStatus, xhr) => {
                data.status == 500 ? Swal.fire("Ada yang salah nih") :
                    data.status == 417 ? Swal.fire("Kode barang jangan Sama gitu ah!") :
                    console.log(typeof (status), status);
            })
        }
    })
    $("#saveUpdate").click((res)=>{
        if (generationEdit == true) {
            Swal.fire("Stop in dulu generate nya!!!")
        } else {
            let id = $("#editId").val()
        // $.put("http://localhost:1880/update/"+id  , data, function(res){
        //     alert(res);
        // })
        $.ajax({
            method: "PUT",
            url: "http://localhost:1880/update/"+id,
            dataType: "JSON",
            contentType: "application/json",
            data: JSON.stringify({
                "namaBarang" : $("#editNama").val(),
                "kodeBarang" : $("#editKode").val(),
                "berat" : $(".editGenerate").text()
            }),
            success: (result) => {
                location.reload()
                Swal.fire("data berhasil diubah", 'success')
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
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          
          $.ajax({
            method: "DELETE",
            url: "http://localhost:1880/delete/" + id,
            dataType: "json",
            success: (result) => {
                    Swal.fire(
                        `Deleted!`,
                        'Data of a row has been deleted.',
                        'success'
                      )
                location.reload()
                
                  
            }
        })
        }
      })
    
}