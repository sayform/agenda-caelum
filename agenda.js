(function () {

    console.log("Start App...");

    // mapear interface. 
    // capturando os elementos da inteface input form, button e tables
    var ui = {
        fields: document.querySelectorAll("input"),
        button: document.querySelector(".pure-button"),
        table: document.querySelector(".pure-table tbody")
    };

    // mapear ações (criar funções)

    // A função que está associada a um evento (click, mouseover) recebe no parâmetro um EVENTO
    var validateFields = function (event) {
        //console.log(ui.fields[0].value);
        //console.log(ui.fields[1].value);
        //console.log(event.target);
        event.preventDefault();

        //Arguments para identificar o que chega junto da função qdo ela é dispara.
        //Identificando o MouseEvent
        //console.log(arguments);

        var errors = 0;
        var data = {};

        //ACESSA OS DADOS DO FORM DE FORMA DINAMICA
        ui.fields.forEach(function (field) {
            //console.log(field.value.length);

            //trim() -> aqui impede de colocar espaços e passar sem erro
            if (field.value.trim().length === 0) {
                field.classList.add("error");
                errors += 1;
            } else {
                field.classList.remove("error");
                //trim() -> retira noo inicio e no fim os espaços digitados, para não popular o objeto errado
                data[field.id] = field.value.trim();
                field.value = field.value.trim();
            }
        });

        if (errors === 0) {
            addContact(data);
        } else {
            // focus() -> coloca o ponteiro para escrever no input
            document.querySelector(".error").focus();
        }

    };

    // GRAVANDO OS DADOS DO FORM USANDO FETCHS
    // Utilizando o Object.assign para juntar objetos e configurar a requisição
    var addContact = function (contact) {

        var endPoint = "http://localhost:8000/contacts"
        // configuração
        var data = {
            method: "POST",
            // só qdo grava (POST) ou atualiza (PUT) precisa do -body
            body: JSON.stringify(contact)
        };
        // informando que os dados são do tipo JSON
        var headers = new Headers();
        headers.append(
            "content-type", "application/json"
        )

        // juntando dois objetos para ter todos os valores em um objeto só (method, body, headers)
        // {headers: headers} -> cria um objeto headers "real", a partir do headers instanciado na variável
        // pode ser feito de outra forma. Declarar o headers antes do data e adcionar no data
        var config = Object.assign({headers: headers}, data);


        fetch(endPoint, config)
            .then(addContactSuccess) //then() -> sucesso
            .catch(addContactError); //catch() -> erro
    };

    var closeMsg = document.querySelector("#boxMsgServer p");

    closeMsg.addEventListener("click", function () {
        document.querySelector("#msgSuccess").classList.add("msg-server");
    }); 

    var addContactSuccess = function () {
        cleanFields();
        listContacts();

        document.querySelector("#msgSuccess").classList.remove("msg-server");
    }

    var addContactError = function () {
        document.querySelector("#msgError").classList.remove("msg-server");
    }

    // função que limpa os campos. Usando Arrow Functions
    var cleanFields = () => ui.fields.forEach(field => field.value = ""); 

   /*  var cleanFields = () => {
        //ui.fields.forEach(function (field) {
         //   field.value = "";
        //}); 

        ui.fields.forEach(field => {
            field.value = "";
        }); 
    } */

    // BUSCANDO OS DADOS PARA POPULAR A TABELA
    var listContacts = function () {
        // forma mais simples para acessar uma API
        var endPoint = "http://localhost:8000/contacts";
        var config = {
            method: "GET",
            headers: new Headers({
                "Content-type": "application/json"
            })
        };

        // Paro o GET é necessário dois THEN, primeiro chega o RESPONSE
        fetch(endPoint, config)
            // implementação do argumts em uma arrow function. Retorna um objeto RESPONSE
            //.then((...args) => console.log("OK", args))
            .then((response) => response.json()) // transforma para json, mas pode ser várias transformações
            .then(listContactsSuccess)
            .catch(listContactsError)
    };

    //TRATANDO O DADO RECEBIDO DO --LISTCONTACTS-- E POPULANDO A TABELA
    var listContactsSuccess = function(list) {
        var html = [];
        //recebem um item da lista
        list.forEach(function(item) {
            //populando a tabela
            html.push(
                `<tr>
                    <td>${item.id}</td>
                    <td>${item.name}</td>
                    <td>${item.email}</td>
                    <td>${item.phone}</td>
                    <td>
                        <a href="#" data-action="delete" data-id="${item.id}">Excluir</a>
                    </td>
                </tr>`
            );
        });
        
        // valida se não tiver dados coloca uma linha informando
        if (html.length === 0){
            html.push (
                `<tr>
                    <td colspan="5">Não existem dados registrados!</td>
                </tr>`
            );
        }

        //join() -> tranforma o array em um texto. Nesse caso recebe o html
        //console.log(html.join());
        ui.table.innerHTML = html.join("");
    };

    var listContactsError = function(data) {
        debugger;
    };

    var removeContact = function (e) {
        //console.log(e.target.dataset);
        e.preventDefault();
        // filtra o elemento clicado na tabela
        if (e.target.dataset.action === "delete" && confirm("Deseja Excluir estes item")) {
            // capta o id do elemento que deve ser deletado
            var endPoint = `http://localhost:8000/contacts/${e.target.dataset.id}`;
            var config = {
                method: "DELETE",
                headers: new Headers({
                    "Content-type": "application/json"
                })
            };
    
            fetch(endPoint, config)
                .then(listContacts) //Chama a função que carrega a tabela
                .catch(listContactsError)
        }
    };

    //FUNÇÃO QUE INICIALIZA OUTRAS FUNÇÕES
    //Deve ser declarada no fim para não ter problema no carregamento e na lógica
    var init = function () {
        // mapping events

        // addEventListener -> usado para executar duas ou mais funções em um mesmo elemento
        ui.button.addEventListener("click", validateFields);

        // carrega os dados na tabela
        listContacts();

        // aplica o evento na tabela toda
        ui.table.addEventListener("click", removeContact);
    }();
})();