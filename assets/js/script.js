//////////////////////////////////  
//Declaración variables globales//
//////////////////////////////////

const slcMoneda = document.querySelector(".select-moneda")
const apiurl = 'https://mindicador.cl/api'
const selectMoneda = document.getElementById("select-moneda")
const btnBuscar = document.getElementById("btn-buscar")
const txtResultado = document.getElementById("p-resultado")
const inputCLP = document.getElementById("input-clp")

///////////////////////////////////
//Obtener la fecha del dia de hoy//
///////////////////////////////////

function getCurrentDate(apiDate) {

// Usar la funcion Date sobre el date de la api

    const date = new Date(apiDate);

// Obtener dia, mes y alo de date

    const day = String(date.getUTCDay()).padStart(2,'0');
    const month = String(date.getUTCMonth()).padStart(2,'0');
    const year = String(date.getFullYear());

//darle formato a una nueva fecha y devolver el valor

    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}

//////////////////////////////////////////////////////
//Obtener data de todos los indicadores desde la api//
//////////////////////////////////////////////////////

async function getData(){

//try & catch en caso de que la conexión no funcione

    try{

//metodo fetch

        const res = await fetch(apiurl);
//en caso de que el metodo fetcb no funcione nos saca de try y envia Error

        if(!res.ok){
            throw new Error('No se pudo obtener indicadores');
        }

//en caso que la conección sea exitosa pasa los datos de la api a data y los devuelve

        const data = await res.json();
        return data
    }

//en caso de error se ejecuta

    catch (error) {
        console.error('Error al obtener indicadores', error);
        throw error;         
    }
}

////////////////////////////////////////////////////////
//Función que obtine los datos de la api por indicador//
////////////////////////////////////////////////////////

async function getDataMonedaType(){

    //seleciona el valor de la option del selectMoneda


    let optionMoneda = selectMoneda.value;
    let url = `${apiurl}/${optionMoneda}`;


    //try & catch en caso de que la conexión no funcione
    
        try{
    
    //metodo fetch
    
            const res = await fetch(url);

    //en caso de que el metodo fetcb no funcione nos saca de try y envia Error
    
            if(!res.ok){
                throw new Error('HTTP error! Status: ${res.status}');
            }
    
    //en caso que la conección sea exitosa pasa los datos de la api a data y los devuelve
    
            const data = await res.json();
            return data
        }
    
    //en caso de error se ejecuta
    
        catch (error) {
            console.error('Error fetching data:', error);
            throw error;         
        }
    }

///////////////////////////////////
//Funcion que prepara el gráfico///
///////////////////////////////////

function configGraphic(data) {

// Creamos las variables necesarias para el objeto de configuración
   
    const typeGraph = "line";

//Transformamos el objeto data obtenido de la api en un array y seleccionamos el elemento [5] "serie" que es un nested array

    const dataArray = Object.values(data);
    const series = dataArray[5];

//Iteramos para obtener un array con fechas desde el array serie que contiene fechas y valores
    const dates = series.map(item => item.fecha);
    const title = data.nombre;
    const colorLine = "green";
    const values = series.map((item) => Number(item.valor));

// Creamos el objeto de configuración usando las variables anteriores
    Chart.defaults.borderColor = "darkgrey";
    Chart.defaults.color = "white"    
    const config = {
        type: typeGraph,
        data: {
        labels: dates,
        datasets: [
            {
                label: title,
                backgroundColor: "greenyellow",
                data: values,
                borderColor: "grey"
            }
        ]}
    };
    return config;
}

/////////////////////////////
//Renderización del Gráfico//
/////////////////////////////

async function renderGrafica() {

//Obtiene la data desde la api, segun indicador economico del select
    
    const data = await getDataMonedaType();

//llama a la función que prepara el grafico

    const config = configGraphic(data);

//llama al elemento html donde se mostrara el gráfico

    const chartDOM = document.getElementById("my-chart");

//crea un ciclo que ve si el gráfico ya fue rerendizado y lo destruye en ese caso, después renderiza el gráfico

    let chartStatus = Chart.getChart("my-chart")
    if (chartStatus != undefined) {
        chartStatus.destroy();
      }
    chartInstance = new Chart(chartDOM, config);
}

//////////////////////////////////
//Renderizar Valor de la moneda //
/////////////////////////////////


async function renderMonedaValue(typeMoneda,input){

//llamamos los datos de la api

    let data = await getData();

//obtenemos la fecha formateada

    let date = getCurrentDate(`${data[typeMoneda].fecha}`)

//definimos el cambio de moneda y redonndeamos

    cambioMoneda = input/data[typeMoneda].valor;
    formattedCambioMoneda = cambioMoneda.toFixed(1);

//interpolamos y entregamos el resultado usando los elementos dentro de la moneda

    txtResultado.innerHTML = `Valor de <span class="p-res-enf">${data[typeMoneda].nombre}</span> es de <span class="p-res-enf2">${formattedCambioMoneda} ${data[typeMoneda].unidad_medida}</span> <br><br> <span class="p-res-enf3">Fecha observación: ${date}</span>`;
}
/////////////////////
//Click input text //
/////////////////////

document.addEventListener("DOMContentLoaded", function() {

    inputCLP.addEventListener("click", function(){

//limpiamos el campo value al hacer click

        inputCLP.value = "";
    });
});

///////////////////////
//Click botón buscar //
///////////////////////


btnBuscar.addEventListener("click", function(){

//seleciona el valor de la option del selectMoneda

    let optionMoneda = selectMoneda.value;

//Excepcion en caso que la option sea "Seleccionar moneda"

    if(!optionMoneda != ""){
        alert('Seleccione Moneda por favor');
    }

//definir input de clp y llamar a la función

    else{
        let txtInput = inputCLP.value
        let NumInput = Number(txtInput)

//Excepción en caso de no ingresar monto numerico en clp

        if(!isNaN(NumInput)){
            renderMonedaValue(optionMoneda,NumInput); 
            renderGrafica();    
        }
        else{
            alert("Ingrese monto valido en CLP")
        }
    }
});

////////////////////
//Obtener options //
////////////////////

async function renderOptions(){

//llama los datos de la api

    let data = await getData();
    let html = "";

//trasnforma estos datos en un Array

    let dataArray = Object.values(data);

//elimina datos nno utiles

    dataArray.splice(0,3);

//itera sobre el Array

    dataArray.forEach(data => {
        html += `<option value="${data.codigo}">${data.nombre}</option>`;
    });
    selectMoneda.innerHTML += html;
}
async function getMonedas() {
const endpoint = "https://api.gael.cloud/general/public/monedas";
const res = await fetch(endpoint);
const monedas = await res.json();
return monedas;
}
/////////////////////////////////////
//Funciones llamadas en iniciacion //
/////////////////////////////////////

renderOptions()

