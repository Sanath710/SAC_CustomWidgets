var getScriptPromisify = src => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}

; (function () {

        const prepared = document.createElement('template')
        prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
			@import url("https://cdn.datatables.net/2.0.1/css/dataTables.dataTables.css");
            @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");
            @import url("https://cdnjs.cloudflare.com/ajax/libs/three-dots/0.3.2/three-dots.min.css");
            

            tbody, td, tfoot, th, thead, tr {
                border-color: inherit;
                border-style: none;
                border-width: 0;
            }

            /* ------------------------- CUSTOM STYLING --------------------------------- */

            select {
                padding-top:0%;
                background-color:inherit;
                outline:none;
            }

            #example th {
                border-bottom: 1px solid #CBCBCB;
                background-color:#F2F2F2;
                align-content: center;
                font-family: Arial;
                color:black;
                font-size:14px;
            }

            /* ------------------------- TOP MOST - HEADER ROW ------------------------- */

            #example .top-header {
                height:32px;
                max-height:32px;
                font-family: Arial;
                color:black;
                font-size:14px;
                font-weight:bold;
                text-align: center;
                padding-top:0%!important;
                padding-bottom:0%!important;
            }

            /* ------------------------- BASE CASE ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(2) {
                background-color:#E0E0E0;
            }

            /* ------------------------- SCENARIO 1 ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(3) {
                background-color:#D9D9D9;
            }

            /* ------------------------- SCENARIO 2 ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(4) {
                background-color:#CBCBCB;
            }

            /* ------------------------- SCENARIO 3 ------------------------- */

            #example > thead > tr:nth-child(1) > th:nth-child(5) {
                background-color:#BDBDBD;
            }

            /* ------------------------- 2nd MOST HEADER ------------------------- */
            
            #example > thead > tr:nth-child(2) {
                height:48px; 
            }

            /* ------------------------- SCENARIO SELECT ELEMENTS HEADER ------------------------- */

            .scenarios {
                background-color:inherit;
                font-family: Arial;
                color:black;
                font-size:14px;
                text-align:center;
                font-weight:bold;
                height:30px;
                border:none;
                cursor: pointer;
            }

            /* ------------------------- GROUPED ROW ------------------------- */

            #example .group > td {
                height:32px;
                padding: 0px 10px!important;
                align-content: center;
                font-weight:bold;
                color: #212121;
                font-family: Arial;
                background-color:#E0E0E0
            }

            /* ------------------------- NORMAL ROW ------------------------- */

            #example td {
                background-color:white;
                height:48px;
                border-bottom:1px solid #CBCBCB!important;
                font-family: Arial;
                font-size:14px;
                align-content: center;
            }

            /* ------------------------- ROW LEVEL SELECT ------------------------- */

            #example .row_level_select {
                font-family: Arial;
                font-size: 14px;
                height: 30px;
                background-color: #DCE6EF;
                border-radius:4px;
                border:none;
                outline:none;
                cursor: pointer;
            }
 
            /* ------------------------- TRUNCATE ROW LEVEL DATA ------------------------- */

            #example .truncate {
                max-width:130px;
                padding-left: 2%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* ------------------------- TOP FIXED HEADER SCROLL ------------------------- */

            #example > thead {
                position: sticky;
                top:0%!important;
                border-bottom: 1px solid #CBCBCB;
                background-color: yellow;
            }

            #example{
                position: absolute;
                border-collapse: separate;
            }

            .mt-2 {
                margin-top: 0% !important;
            }

                
          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.js"></script>
          <div id="root" style="width:100%; height:100%; padding:0%; overflow: auto; position: absolute; scrollbar-width:thin; display: inline-grid;">
          <div class="dot-flashing" id='loader' style="align-self:center; justify-self:center; visibility:hidden;"></div>
          <table id="example" class="table" style="visibility:hidden;">
              <thead>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        `

        var total_cols = 0;
        var fixRowsObj = {};
        const masterRows = [];

        class CustomTable extends HTMLElement {

            constructor() {
                console.clear()
                super()
                this._shadowRoot = this.attachShadow({ mode: 'open' })
                this._shadowRoot.appendChild(prepared.content.cloneNode(true))
                this._root = this._shadowRoot.getElementById('root')
                this._table = this._shadowRoot.getElementById('example')
                this._dotsLoader = this._shadowRoot.getElementById('loader');
                this._props = {}
                this.loadLibraries()
                // this.render()
            }

            async loadLibraries() {
                var start = performance.now();
                this._dotsLoader.style.visibility = "visible";
                await getScriptPromisify(
                    'https://cdn.datatables.net/2.0.1/js/dataTables.js'
                )
                await getScriptPromisify(
                    'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js'
                )
                await getScriptPromisify(
                    'https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js'
                )
                await getScriptPromisify(
                    'https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js'
                )
                await getScriptPromisify(
                    'https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js'
                )
                // console.log("----", DataTable)
                var end = performance.now();
                var time = end - start;
                console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
                this._dotsLoader.style.visibility = "hidden";
            }
            
            // onCustomWidgetBeforeUpdate(changedProperties) {
            //     // if(changedProperties["_headers"]) {
            //     //     this._headers = changedProperties["_headers"];
            //     //     this._dateColName = changedProperties["_dateColName"]; //selectionColumn
            //     //     this._hideExtraVisibleColumnFromIndex = changedProperties["_hideExtraVisibleColumnFromIndex"];
            //     //     this._hide_Individual_ExtraVisibleColumnOfIndices = changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"];
            //     //     this._customHeaderNames = changedProperties["_customHeaderNames"];
            //     // }
            //     console.log("BU")

            // }

            onCustomWidgetAfterUpdate(changedProperties) {
                if(changedProperties["_headers"]) {
                    this._headers = changedProperties["_headers"];
                    this._dateColName = changedProperties["_dateColName"]; //selectionColumn
                    this._hideExtraVisibleColumnFromIndex = changedProperties["_hideExtraVisibleColumnFromIndex"];
                    this._hide_Individual_ExtraVisibleColumnOfIndices = changedProperties["_hide_Individual_ExtraVisibleColumnOfIndices"];
                    this._customHeaderNames = changedProperties["_customHeaderNames"];
                    this._customTopHeader = this._customHeaderNames["TOP_HEADER"];
                }
                // console.log("AU")
            }

            // onCustomWidgetResize (width, height) {
            //   this.render()
            // }
            // headers, customHeaderNames, selColumnName, hideExtraVisibleColumnFromIndex, hide_Individual_ExtraVisibleColumnOfIndices,

            setResultSet(rs, col_to_row = -1, colspan_to_top_headers) {

                this._dotsLoader.style.visibility = "visible";
                this._table.style.visibility = "hidden";
                this._root.style.display = "inline-grid";

                this._resultSet = [];
                this._nonNumericColumnIndices_UnitConversion = new Set();
                this._masterRows_UnitConversion = [];
                this._masterRows_UnitConversion_Flag = false;
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row; // Row Grouping

                var headers = this._headers
                // console.log(headers);

                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                // this._dateColName = selColumnName; //selectionColumn
                // this._hideExtraVisibleColumnFromIndex = hideExtraVisibleColumnFromIndex;
                // this._hide_Individual_ExtraVisibleColumnOfIndices = hide_Individual_ExtraVisibleColumnOfIndices;
                this._colspan_EmptyCase = parseInt(colspan_to_top_headers["EmptyCase"]);
                this._colspan_BaseCase = parseInt(colspan_to_top_headers["BaseCase"]);
                this._colspan_RestCase = parseInt(colspan_to_top_headers["RestCase"]);
               
                // this._customHeaderNames = customHeaderNames;

                console.log("Col-Orders",this._colOrder)
                console.log("Scenario-Orders",this._scenarioOrder)
                console.log("Fixed Scenarios",this._fixedScenario)
                console.log("Measure Order", this._measureOrder)
                console.log("Dimensions", this._dimensions)
                console.log("Exclude Headers",this._excludeHeaders)


                for(var i = 0; i < rs.length;) {
                    var tempArr = [], dims = new Set();
                    for(var k = 0; k < this._dimensions.length; k++) {
                        dims.add(rs[i][this._dimensions[k]].description);
                        this._nonNumericColumnIndices_UnitConversion.add(k);
                    }
                    for(var j = 0; j < this._measureOrder.length; j++) {
                        if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                            tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                        } else {
                            while(JSON.stringify(this._measureOrder[j]) != JSON.stringify(rs[i]["@MeasureDimension"].description)) {
                                tempArr.push("-")
                                j+=1;
                                if(j > this._measureOrder.length) {
                                    console.log("Hit to Infinite Loop Case...")
                                    return;
                                }
                            }
                            if(JSON.stringify(this._measureOrder[j]) == JSON.stringify(rs[i]["@MeasureDimension"].description) && rs[i]["@MeasureDimension"].formattedValue != undefined) {
                                tempArr.push(rs[i]["@MeasureDimension"].formattedValue)
                            }
                        }
                        i++;
                        if(i >= rs.length || tempArr.length > this._measureOrder.length) {
                            break;
                        }
                    }
                    if(i > rs.length) {
                        break;
                    }
                    tempArr.unshift(...Array.from(dims))
                    // console.log(tempArr)
                    this._resultSet.push(tempArr)
                    // console.log(tempArr)
                }

                console.log("-- Result Set --")
                console.log(this._resultSet)
                console.log("----------------")

                this.render();

            }

            // applyStyling(table_css_styling, row_css_styling, col_css_styling) {
            //     this._tableCSS = table_css_styling
            //     this._rowCSS = row_css_styling
            //     this._colCSS = col_css_styling
            //     this.render()
            // }

            applyScaling(scaleTo = "K", numberOfDecimals = 2) {

                var t = this._dataTableObj;
                var lcl_tableColumnNames = this._tableColumnNames;
                this._scaleTo = scaleTo;
                scaleTo = scaleTo.toUpperCase();

               
                var lcl_nonNumericColumns = Array.from(this._nonNumericColumnIndices_UnitConversion);
                // console.log(lcl_tableColumnNames, "------",lcl_nonNumericColumns)

                if(!this._masterRows_UnitConversion_Flag) {
                    // this._dataTableObj.rows().every(function(idx) {
                    //     this._masterRows_UnitConversion.push(t.cell(idx))
                    // });
                    this._masterRows_UnitConversion_Flag = true;
                    for(var i = 0; i < this._dataTableObj.rows().count(); i++) {
                        this._masterRows_UnitConversion.push(this._dataTableObj.rows(i).data()[0].slice());
                    }
                    // console.log(this._masterRows_UnitConversion)
                    // console.log(this._dataTableObj.rows().count());
                }

                var lcl_masterRows_UnitConversion = this._masterRows_UnitConversion.slice(); 
                var lcl_scaledRows = [];

                this._dataTableObj.rows().every(function(idx) {
                    var tempRow = [];
                    for(var i = 0; i < lcl_tableColumnNames.length; i++) {
                        var cell = t.cell(idx, i);
                        if(!lcl_nonNumericColumns.includes(i)) {
                            if(cell.data() != undefined) {
                                if(scaleTo == "M") {
                                    cell.data(parseFloat(parseFloat(lcl_masterRows_UnitConversion[idx][i].replace(",","")/1000000)).toFixed(numberOfDecimals))
                                } 
                                else {
                                    cell.data(parseFloat(parseFloat(lcl_masterRows_UnitConversion[idx][i].replace(",",""))).toFixed(numberOfDecimals))
                                }
                            }
                        }
                        tempRow.push(cell.data())
                    }
                    lcl_scaledRows.push(tempRow.slice());
                    // console.log(tempRow)
                }); 

                if(this._masterRows_UnitConversion) {
                    var i = 0;
                    for(var key in fixRowsObj) {
                        fixRowsObj[key] = lcl_scaledRows[i]
                        i++;
                    }
                }
                console.log(fixRowsObj,"---",lcl_scaledRows)
            }

            showScenarios(fixedCols, col_start_indices, top_header_names_to_show, no_of_succeeding_measures) {

                var colIndices = col_start_indices;
                var no_of_succeeding = no_of_succeeding_measures;
                var headerNames_to_show = this._fixedScenario.slice();
                headerNames_to_show = headerNames_to_show.concat(top_header_names_to_show);
                var fixedCols = fixedCols;
                var visibleCols = []; 

                ////// Fixed cols i.e base case
                for(var i = 0; i <= fixedCols; i++) {
                    visibleCols.push(i);
                }

                // // console.log(colIndices, "---", no_of_succeeding)

                ////// For showing Columns from indices
                for(var i = 0; i < colIndices.length; i++) {
                    for(var j = parseInt(colIndices[i]); j <= parseInt(colIndices[i])+no_of_succeeding; j++) {
                        // console.log(j, "->", parseInt(colIndices[i])+no_of_succeeding)
                        this._dataTableObj.column(j).visible(true);
                        visibleCols.push(j)
                    }
                }

                // console.log(visibleCols)

                /////// hiddenCols = hiddenCols.concat(this._hide_Individual_ExtraVisibleColumnOfIndices);

                ////// For Hiding Columns from indices
                for(var i = 0; i < this._hideExtraVisibleColumnFromIndex; i++) {
                    if(!visibleCols.includes(i)) {
                        this._dataTableObj.column(i).visible(false);
                        // console.log(i)
                    }
                }
                // console.log(this._dataTableObj.column(2).data())

                ////// Top header block to be displayed
                for(var i = 0; i < headerNames_to_show.length; i++) {
                    document.querySelector("v1-custom-table").shadowRoot.querySelector("#"+headerNames_to_show[i]).style.display = "";
                }

                ////// (loop cntr = 4 bcz we need to display only 4 conditions)
                for(var i = 0; i < 4; i++) {
                    if(!headerNames_to_show.includes(this._scenarioOrder[i])) {
                        // console.log(this._scenarioOrder[i])
                        document.querySelector("v1-custom-table").shadowRoot.querySelector("#"+this._scenarioOrder[i]).style.display = "none";
                    }
                }

            }

            async render() {

                if (!this._resultSet) {
                    return
                }

                // this._table.style.visibility = "hidden";


                // var start = performance.now();
                // if (!isLibAvail) {
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/2.0.1/js/dataTables.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/js/bootstrap.bundle.min.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/2.0.1/js/dataTables.bootstrap5.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/buttons/3.0.0/js/dataTables.buttons.js'
                //     )
                //     await getScriptPromisify(
                //         'https://cdn.datatables.net/buttons/3.0.0/js/buttons.bootstrap5.js'
                //     )
                //     isLibAvail = true
                // }
                // var end = performance.now();
                // var time = end - start;
                // console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")

                // await getScriptPromisify('https://cdn.datatables.net/buttons/3.0.0/js/buttons.colVis.min.js')

                var table_cols = []

                var col_dimension = this._dimensions;
                var col_measures = this._measureOrder;
                var fixedScenarioAt = col_dimension.indexOf("SCENARIO_NAME")
                console.log("Fixed Scenario At : ", fixedScenarioAt);

                console.log('ResultSet Success')

                col_dimension = col_dimension.slice(0, col_dimension.indexOf("SCENARIO_NAME"))

                if(this._colOrder[0] == "FY") {
                    // if(this._colOrder[0] != "FY") {
                    //     col_dimension = col_dimension.concat(this._colOrder)
                    // } 
                    if(Object.keys(this._customHeaderNames).length > 0) {
                         for (var i = 0; i < this._customHeaderNames["DIMEN_NAME"].length; i++) {
                            table_cols.push({
                                title: this._customHeaderNames["DIMEN_NAME"][i]
                            })
                        }
        
                        for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                            table_cols.push({
                                title: this._customHeaderNames["MES_NAME"][j]
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._customHeaderNames["SCENARIO_NAME"][i]
                                })
                            }
                            for(var j = 0; j < this._customHeaderNames["MES_NAME"].length; j++) {
                                table_cols.push({
                                    title: this._customHeaderNames["MES_NAME"][j]
                                })
                            }
                        }
                    } else {
                        for (var i = 0; i < col_dimension.length; i++) {
                            table_cols.push({
                                title: col_dimension[i]
                            })
                        }
        
                        for(var j = 0; j < this._measureOrder.length; j++) {
                            table_cols.push({
                                title: col_measures[j]
                            })
                        }
                       
                        for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                            if(this._scenarioOrder[i] != "FY") {
                                table_cols.push({
                                    title: this._scenarioOrder[i]
                                })
                            }
                            for(var j = 0; j < this._measureOrder.length; j++) {
                                table_cols.push({
                                    title: col_measures[j]
                                })
                            }
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)
                this._tableColumnNames = table_cols;

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = this._hideExtraVisibleColumnFromIndex; i < table_cols.length; i++) {
                    hideCols.push(i)
                }

                for(var i = 0; i < this._hide_Individual_ExtraVisibleColumnOfIndices.length; i++) {
                    hideCols.push(this._hide_Individual_ExtraVisibleColumnOfIndices[i])
                }

                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined;
                // $(this._table).on('init.dt', function () {
                //     console.log('Table initialisation complete: ' + new Date().getTime());
                // })
                // .DataTable();

                ////// Handling situation for what if data table library didn't got loaded ... 
                // try {
                //     new DataTable()
                // } catch(err) {
                //     console.log("-------- Exception caught & handled ... : "+err);
                //     await this.loadLibraries();
                // }

                if (!jQuery().dataTable) {
                    console.log("-------- Datatable not initialized. \nRe-Initialzing Datatable libraries ...  ");
                    await this.loadLibraries();
               }

                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    // hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : hideCols,
                                visible: false,
                                // className: 'dt-body-left'
                            },
                            { 
                                targets:1, className:"truncate"
                            }
                        ],
                         createdRow: function(row){
                            var td = $(row).find(".truncate");
                            td["prevObject"]["context"]["children"][0].title = td["prevObject"]["context"]["cells"][0]["innerText"];
                        },
                        order: [[groupColumn, 'asc']],
                        displayLength: 25,
                        drawCallback: function (settings) {
                            var api = this.api()
                            var rows = api.rows({ page: 'current' }).nodes()
                            var last = null

                            api
                                .column(groupColumn, { page: 'current' })
                                .data()
                                .each(function (group, i) {
                                    if (last !== group) {
                                        $(rows)
                                            .eq(i)
                                            .before(
                                                '<tr class="group"><td colspan="' +
                                                table_cols.length +
                                                '">' +
                                                group +
                                                '</td></tr>'
                                            )
                                        last = group
                                    }
                                })
                        },
                        // initComplete: function (settings, json) {
                        //     alert('DataTables has finished its initialisation.');
                        // },
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                } else {
                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: false, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                targets: hideCols, //_all
                                visible:false
                                // className: 'dt-body-left'
                            }
                        ],
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true,
                    })

                   
                }

                if(tbl.data().any()) {
                    tbl.rows().remove().draw();
                }

                this._dataTableObj = tbl;

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr role='row'>";
                
                // 1st empty top header blocks...
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    // topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 3}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._colspan_EmptyCase}'></th>`;
                    // topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length + 1}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
    

                if(this._customTopHeader) {
                    for(var i = 0; i < 4; i++) {
                        topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._customTopHeader[i]}'>${this._customTopHeader[i]}</th>`
                    }
                } else {
                    for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                        // Base Case/Scenario
                        if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                            topHeader += `<th class='top-header' colspan='${this._colspan_BaseCase}' id='${this._scenarioOrder[i]}'>${this._scenarioOrder[i]}</th>`
                        } else {
                            // Rest Case/Scenario
                                for(var j = 0; j < this._scenarioOrder.length; j++) {
                                    if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                        if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                            topHeader += `<th class='top-header' id='${this._scenarioOrder[j]}' colspan='${this._colspan_RestCase}'>${this._scenarioOrder[j]}`;
                                        } 
                                    }
                                }
                            topHeader +=  `</th>`;
                        }
                    }
                    topHeader += "</tr>";
                }
               


                // @--- uncomment below line
                // document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                if(document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").children.length <= 1 && !tbl.data().any()) { // 5 since Empty : 1 + Base : 1 + Rest Scenario : 3
                    document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                }
//  ------------------------------ TO BE UNCOMMENTED ----------------------

                // console.log(topHeader)
               
                // Top Most Header Block Ends


                tbl.on('click', 'tbody tr', e => {
                    let classList = e.currentTarget.classList
                    tbl
                        .rows('.selected')
                        .nodes()
                        .each(row => row.classList.remove('selected'))
                    classList.add('selected')
                    // console.log(tbl.row('.selected').data())
                })
                
                // Master Reference Node For Selection Elements used Inside updateRow(), updateColumns() Method
                var hMap = {};
                var is_col_updated = false;

                function updateColumns(state, no_of_dimens, no_of_excludes, no_of_mes, scenario_len) {

                    is_col_updated = true;
                    console.log("MASTER", masterRows)
                    var selectData = tbl.rows().data()
                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    var sliceTill = no_of_dimens - no_of_excludes + ((no_of_mes + 1) * selOptID);

                    for(var i = 0; i < scenario_len; i++) {
                        var idxAt = no_of_dimens - no_of_excludes + no_of_mes + ((no_of_mes + 1) * i);
                        hMap[i] = idxAt
                    }

                    console.log("HMAP - ",hMap);

                    for(var i = 0; i < selectData.length; i++) {

                        var updatedColData = selectData[i]; 
                        var mr = masterRows[i].slice(sliceTill - 1, sliceTill + no_of_mes);
                        // console.log("MR", mr, "----", hMap[state.id - 1], "---", state.id)
                        // console.log(mr, "---", mr.length, "---", updatedColData, "+++", hMap[state.id - 1])

                        for(var j = 0, cntr = hMap[state.id - 1]; j < mr.length; j++) {
                            if(j == 0) {
                                if(updatedColData[cntr].id == undefined) {
                                    const parser = new DOMParser();
                                    const htmlDoc = parser.parseFromString(updatedColData[cntr], 'text/html'); 
                                    var idx_0_state = htmlDoc.getElementsByTagName("select")[0];
                                    idx_0_state.getElementsByTagName("option")[selOptID - 1].selected = 'selected';
                                    updatedColData[cntr] = idx_0_state;
                                    // console.log(selOptID - 1, idx_0_state, "---", mr[0],"--->",updatedColData[cntr]);
                                } else {
                                    var idx_0_state = updatedColData[cntr]
                                    idx_0_state.getElementsByTagName("option")[selOptID - 1].selected = 'selected';
                                    // console.log("ELSE---------",idx_0_state);
                                    updatedColData[cntr] = idx_0_state;
                                }
                               

                            // console.log(htmlDoc)
                            } 
                            else {
                                // console.log(updatedColData[cntr], prevSel, hMap[prevSel])
                                updatedColData[cntr] = mr[j]
                            }
                            // console.log(updatedColData[cntr])
                            // console.log("---")
                            cntr += 1;
                            // console.log(sliceTill - 1)
                            // console.log("----")
                            // sliceTill += 1;
                        }

                        // console.log("------", updatedColData);
                        tbl.row(i).data(updatedColData)
                    }

                    // console.log(selectData, "---", state.id, "---",selOptID)

                }

                window.updateColumns = updateColumns;
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom) 
                {
                    var selectData = tbl.row('.selected').data()
                    var ROW_ID = tbl.row('.selected')[0][0];
                    // selectData.splice(hMap[0] + 1, 1, ...masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes))
                    // console.log(selectData, sliceFrom)


                    // console.log("UPDATE - ROW -->",selectData)
                    // @---
                    // var row_updated_arr = selectData.slice(0, no_of_dimens - no_of_excludes + no_of_mes + 1)
                    var row_updated_arr = selectData.slice(0, sliceFrom + 1)

                    // console.log("ROW UPDATED INITIALs - ",row_updated_arr)

                    state.getElementsByTagName('option')[state.options.selectedIndex].setAttribute('selected', 'selected')
                    // console.log("State Changed", state)

                    var selOptID = state.getElementsByTagName('option')[state.options.selectedIndex].id
                    // var selOptVal = JSON.parse(state.getElementsByTagName('option')[state.options.selectedIndex].value)
                    var selOptVal = fixRowsObj[identifer]
                    // console.log(state)

                    // @ ---
                    // var sliced = undefined, data = {};
                    // if(scaleValue == "K-M") {
                    //     var idx = Object.keys(fixRowsObj).indexOf(identifer)
                    //     sliced = this._masterRows_UnitConversion[idx].slice(sliceFrom, ), data = {};
                    // } else {
                    //     sliced = selOptVal.slice(sliceFrom, ), data = {};
                    // }
                    var sliced = selOptVal.slice(sliceFrom, ), data = {};


                    // ----------------------- Handling base case for WHAT-IF column is updated first --------- 
                    if(is_col_updated && selOptID == 0) {
                        for(var k = 1, mr_k = 0; k <= no_of_mes; k++) {
                            sliced[k] = masterRows[ROW_ID].slice(hMap[0] + 1, (hMap[0] + 1) + no_of_mes)[mr_k];
                            mr_k++;
                        }
                    }
                    // ----------------------------------------------------------------------------------------


                    // console.log("SLICED ---- ", sliced)
                    for(var i = 1, index = 0; i < sliced.length; i++) {
                        data[index] = sliced.slice(i, i + no_of_mes)
                        i += no_of_mes
                        index += 1
                    }
                    // console.log("0000",data, data[selOptID])

                    var len = row_updated_arr.length;
                    row_updated_arr = row_updated_arr.concat(selectData.slice(len, ));
                    // @---
                    // row_updated_arr[no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id)] = state
                    row_updated_arr[sliceFrom + parseInt(state.id)] = state

                    // @---
                    // var sliceLen = no_of_dimens - no_of_excludes + no_of_mes + parseInt(state.id) + 1
                    var sliceLen = sliceFrom + parseInt(state.id) + 1
                    
                    var dataCopy  = Array.from(data[selOptID]);
                    // console.log("DATA", dataCopy)
                    for(var i = sliceLen, idx = 0; i < sliceLen + no_of_mes; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                }

                window.updateRow = updateRow

                var dateName = new Set(), scenarioSeq = this._scenarioOrder.slice(1, );

                for(var i = 0, prev_key = "", seqID = 0; i < this._resultSet.length;) {

                    if(this._fixedScenario.includes(this._resultSet[i][fixedScenarioAt])) {
                        // var obj = Object.fromEntries(this._scenarioOrder.slice(1,).map(key => [key, []]));
                        var obj = {};
                        var fixRows = [];
                        dateName = new Set();
                        if(this._colOrder[0] == "FY") {
                            var index = this._resultSet[i].length - this._measureOrder.length;
                            // for(var j = 0; j < fixedScenarioAt; j++) {
                            //     fixRows.push(this._resultSet[i][j])
                            // }
                            // fixRows.push(this._resultSet[i][fixedScenarioAt])
                            // console.log(fixRows,"+++");
                            // for(var k = 0; k < this._measureOrder.length; k++) {
                            //     fixRows.push(this._resultSet[i][index + k])
                            // }
                            fixRows = this._resultSet[i].slice()
                        }
                    // console.log(this._resultSet[i], this._resultSet[i+1])
                        // @-- bug fix...
                        if(this._resultSet[i + 1] != undefined && this._resultSet[i].slice(0, fixedScenarioAt).join("_#_") == this._resultSet[i + 1].slice(0, fixedScenarioAt).join("_#_")) {
                            i+=1;
                        }
// console.log(obj);
                    }

                    var key = fixRows.slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_")+"_#_";
                    // console.log(fixRows)
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );
                    dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);

// console.log(key)
                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {
                        for(var j = 0; j < fixedScenarioAt; j++) {
                            tempKey += this._resultSet[i][j]+"_#_"
                        }
                        // fixRows.splice(fixRows.length, 0, ...this._resultSet[i].slice(this._dimensions.length - 1, ))
                        var scene = this._resultSet[i].slice(fixedScenarioAt, )[0];
                        // console.log("---",scene)
                        if(!this._fixedScenario.includes(scene)) {
                            obj[scene] = this._resultSet[i].slice(this._dimensions.length - 1, )
                        }
                        // console.log(this._resultSet[i].slice(this._dimensions.length - 1, ))
                        seqID++;
                        if(seqID >= scenarioSeq.length) {
                            seqID = 0;
                        }

                        // console.log(scenarioSeq[seqID],"---", scene)
                        dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        i += 1;
                    }

// console.log(fixRows);

                    // Final Assignment of fixRows
                    // console.log("HIIIII",this._resultSet[i] != undefined, fixRows.slice(0, fixedScenarioAt).join("_#_"), "---", this._resultSet[i].slice(0, fixedScenarioAt).join("_#_"))
                    if(this._resultSet[i] != undefined && fixRows.slice(0, fixedScenarioAt).join("_#_") != this._resultSet[i].slice(0, fixedScenarioAt).join("_#_")) {
                        // dateName = new Set(Object.keys(obj).filter(v => !this._fixedScenario.includes(v)))
                        var dname = [], c = 0; // ----
                        for(const [k, v] of Object.entries(obj)) {
                            // console.log(obj)
                            if(k != this._fixedScenario[0]) {
                                if(v.length < 1) {
                                    c++;
                                } else {
                                    if(fixRows.length != table_cols.length){
                                        fixRows = fixRows.concat(v)
                                        dname.push(v[0])// ----
                                    }
                                }
                            }
                        }

                        var tempMes = fixRows.slice(-this._measureOrder.length);
                        tempMes.unshift("-")
                        
                        for(var p = 0; p  < c*this._measureOrder.length+c; p++) {
                            fixRows.push("-")
                        }
                         // @ ------------------------------------------------------------------ REMOVE IF NEC 
                         if(fixRows.length < table_cols.length) {
                            if(Object.keys(obj).length < 1) {
                                for(var t = fixRows.length, empCnt = 0; t < table_cols.length; t++) {
                                    fixRows.push(tempMes[empCnt])
                                    empCnt++;
                                    if(empCnt >= tempMes.length) {
                                        empCnt = 0;
                                    }
                                }
                                dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])
                                // @----- udpate new
                                // console.log("--------",fixRows[this._dimensions.indexOf(this._dateColName)],"----",this._dimensions.indexOf(this._dateColName))
                            } else {
                                for(var t = fixRows.length; t < table_cols.length; t++) {
                                    fixRows.push("-")
                                }
                            }
                            // console.log(fixRows, "----<")
                        }
                        // @ ------------------------------------------------------------------  ^^^^^^^^^^^
                        dateName = new Set(dname)// ----
                        // console.log(fixRows)
                        // console.log(dname, dateName)
                        // console.log(fixRows,obj,"+++-------")
                        // }
                    } else if(this._resultSet[i] == undefined) {
                        // dateName = new Set(Object.keys(obj).filter(v => !this._fixedScenario.includes(v)))
                        var dname = [], c = 0;// ----
                        for(const [k, v] of Object.entries(obj)) {
                            if(k != this._fixedScenario[0]) {
                                if(v.length < 1) {
                                    c++;
                                } else {
                                    fixRows = fixRows.concat(v)
                                    dname.push(v[0])// ----
                                }
                            }
                        }

                        var tempMes = fixRows.slice(-this._measureOrder.length);
                        tempMes.unshift("-")

                        for(var p = 0; p  < c*this._measureOrder.length+c; p++) {
                            fixRows.push("-")
                        }
                        // @ ------------------------------------------------------------------ REMOVE IF NEC 
                        if(fixRows.length < table_cols.length) {
                            if(Object.keys(obj).length < 1) {
                                for(var t = fixRows.length, empCnt = 0; t < table_cols.length; t++) {
                                    fixRows.push(tempMes[empCnt])
                                    empCnt++;
                                    if(empCnt >= tempMes.length) {
                                        empCnt = 0;
                                    }
                                }
                                dname.push(fixRows[this._dimensions.indexOf(this._dateColName)])
                                // @----- udpate new
                            } else {
                                for(var t = fixRows.length; t < table_cols.length; t++) {
                                    fixRows.push("-")
                                }
                            }
                        }
                        // @ ------------------------------------------------------------------  ^^^^^^^^^^^
                        dateName = new Set(dname)// ----
                        // console.log(fixRows,obj,"-------")
                    }
                    // console.log("--",scenarioSeq[seqID], "---",this._scenarioOrder[this._scenarioOrder.length - 1])
                   
                    // console.log(key, tempKey);

                    if(table_cols.length == fixRows.length) {
                        seqID = 0;
                        var dateNameArr = Array.from(dateName);
                        // console.log("----",dateNameArr)
                        // var sliceLen = Math.abs(this._dimensions.length - this._excludeHeaders.length + this._measureOrder.length);
                        var sliceLen = this._resultSet[0].length;
                        var sliced = fixRows.slice(sliceLen)
                        var cnt = 0;
                        // console.log(sliced, this._dimensions.length)
// console.log("----", dateName)
                        var options = "";
                        for(var k = 0, optIdx = 0; k < sliced.length; k++) {
                            var select_html = `<select id='${k}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}", ${this._resultSet[0].length})'>`;
                            // var occurance = fixRows.slice(k, k + this._measureOrder.length).reduce((acc, curr) => (acc[curr] = (acc[curr] || 0) + 1, acc), {});
                            // console.log("DATA", occurance["-"])
                        //    @ update new uncomment below ----------------------------------------------- @
                            // if(cnt >= dateNameArr.length) {
                            //     var emptySelect = `<select id='${k}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}", ${this._resultSet[0].length})'>`;
                            //     var emptyOption = `<option selected disabled></option>`;
                                
                            //     for(var p = 0; p < dateNameArr.length; p++) {
                            //         emptyOption += `<option id='${p}'>${dateNameArr[p]}</option>`
                            //     }
                                
                            //     emptySelect += emptyOption + `</select>`;
                            //     sliced[k] = emptySelect;
                            // } else {
                                var options = "";
                                for(var p = 0; p < dateNameArr.length; p++) {
                                    if(optIdx == p) {
                                        options += `<option id='${p}' selected>${dateNameArr[p]}</option>`
                                    } else {
                                        options += `<option id='${p}' >${dateNameArr[p]}</option>`
                                    }
                                }
                                select_html += options + `</select>`;
                                sliced[k] = select_html;
                                this._nonNumericColumnIndices_UnitConversion.add(k+this._dimensions.length - 1);
                                cnt++;
                            // }
                        //    @ update new uncomment till above ----------------------------------------------- @
                            k += this._measureOrder.length;
                            optIdx += 1;
                        }
                        fixRows = fixRows.slice(0, sliceLen).concat(sliced);
                        // console.log(fixRows,"-----")


                        fixRowsObj[fixRows[0]+"_#_"+fixRows[1]] = fixRows
                        masterRows.push(fixRows.slice());
                        tbl.row.add(fixRows).draw(false)
                        fixRows = [];
                        this._nonNumericColumnIndices_UnitConversion.add(k+this._dimensions.length - 1)
                        // console.log(fixRows)
                    }

                    prev_key = key;

                }

                // Styling Block Starts

                if (this._tableCSS) {
                    console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS) {
                    console.log(this._rowCSS)
                    document
                        .querySelector('v1-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector('v1-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS) {
                    console.log(this._colCSS)
                    document
                        .querySelector('v1-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                const list = document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead");

                // if (list.hasChildNodes()) {
                // list.removeChild(list.children[0]);
                //     document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);

                // }

                for(var i = 0; i < list.children.length - 1; i++) {
                    list.removeChild(list.children[i]);
                }
                document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
                
                this._dotsLoader.style.visibility = "hidden";
                this._table.style.visibility = "visible";
                this._root.style.display = "block";

                document.querySelector("v1-custom-table").shadowRoot.querySelector("#example > thead > tr:nth-child(2) > th:nth-child(2)").click();
                // Styling Block Ends here
            }
        }
        customElements.define('v1-custom-table', CustomTable)
    })()
