$(document).ready(function () {
  function loadScreen() {
    const data = getData();
    loadHeader(data);
    loadSections(data);
  }

  function getData() {
    let dataFromFile;

    $.ajax({
      async: false,
      url: '../data/data.js',
      dataType: "script"
    })
      .done(function (data) {
        dataFromFile = JSON.parse(data);
        console.log("Data retrieved from file.");
      });

    return dataFromFile;
  }

  function loadHeader(data) {
    $("#header").append(`
            <div id='appName'>
                ${data.app_name}
            </div>
            <div id='runId'>
                Run ID: ${data.test_run_id}
            </div>
            <div id='timestamp'>
                Time Started: ${data.time_stamp}
            </div>
        `);
  }

  function loadSections(data) {
    let testStatus = false;
    data.test_cases.forEach(testCase => {
      testStatus = testCase.status;
      $('#testCases').append(`
                <div class='testPanel'>
                    <div id=${testCase.test_name.split(" ").join("")} class='testHeader'>
                        <span class='testName'>${testCase.test_name}</span>
                        ${/*<span class="${testStatus ? "checkmark" : "exclamation"} material-icons">
                            ${testStatus ? "check_circle" : "error"}
                        </span>*/''}
                        <button class='collapsible'>Steps</button>
                        <div class='content steps'></div>
                    </div>
                </div>
            `);
      $(`#${testCase.test_name.split(" ").join("")} .testName`).addClass(testStatus ? 'green' : 'red')
      addStepPanel(testCase);
    });
  }

  function addStepPanel(testCase) {
    testCase.test_steps.forEach(step => {
      $(`#${testCase.test_name.split(" ").join("")} .content`).append(`
                <div id=${step.step_name.split(" ").join("")} class='stepSection'>
                    <div class='stepHeader'>${step.step_name}</div>
                    <img src='../data/${step.screenshot}' class='chartSection'></img>
                    <table id='${step.step_name.split(" ").join("")}_table' class='chartSection'></table>
                    <div id='${step.step_name.split(" ").join("")}_chart' class='chartSection chart'></div>
                </div>
            `);
      loadTable(step);
      loadChart(step);
    });
  };

  function loadTable(step) {
    let headerHTML = '<thead><tr>';
    let rowHTML = '<tr>';
    let headerList = [];

    for (const [key, value] of Object.entries(step)) {
      if (!(key == 'step_name') && !(key == 'screenshot')) {
        if (!headerList.includes(key)) {
          headerList.push(key);
          headerHTML += `<th>${key}</th>`;
        }
        value.forEach(val => {
          rowHTML += `<td>${val}</td>`
        });
        rowHTML += '</tr>'
      }
    };

    let html = headerHTML + '</thead>' + rowHTML;
    $(`#${step.step_name.split(" ").join("")}_table`).append(html);
    $(`#${step.step_name.split(" ").join("")}_table`).DataTable({
      searching: false,
      ordering: false,
      paging: false,
      ordering: false,
      info: false,
      autoWidth: false,
      columns: [
        null,
        { "width": "50%" },
        { "width": "50%" },
      ]
    });
  }

  function loadChart(step) {
    let seriesData = [];

    for (const [key, value] of Object.entries(step)) {
      if (!(key == 'step_name') && !(key == 'screenshot')) {
        seriesData.push({
          name: key,
          data: value
        });
      };
    };

    Highcharts.chart(`${step.step_name.split(" ").join("")}_chart`, {
      chart: {
        type: 'line',
        height: 358
      },

      title: {
        text: ''
      },

      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
      },

      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
        }
      },

      series: seriesData
    });
  }

  function addCollapse() {
    $(".collapsible").each(function (i, element) {
      element.addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = "5000px";
        }
      });
    });
  }

  loadScreen();
  addCollapse();
});
