var getScriptPromisify = src => {
    return new Promise(resolve => {
        $.getScript(src, resolve)
    })
}
var isLibAvail = false;
; (function () {
        const prepared = document.createElement('template')
        prepared.innerHTML = `
          <style type="text/css">
            @import url("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.0/css/bootstrap.min.css");
            @import url("https://cdn.datatables.net/2.0.1/css/dataTables.bootstrap5.css");
			@import url("https://cdn.datatables.net/2.0.1/css/dataTables.dataTables.css");
            @import url("https://cdn.datatables.net/buttons/3.0.0/css/buttons.bootstrap5.css");
            

            tbody, td, tfoot, th, thead, tr {
                border-color: inherit;
                border-style: none;
                border-width: 0;
            }

          </style>
          <script src= "https://code.jquery.com/jquery-3.7.1.js"></script>
          <div id="root" style="width: 100%; height: 100%; padding:0.5%; padding-top:0%; overflow: scroll;">
		  	<table id="example" class="table" style="width:100%">
              <thead>
              </thead>
              <tbody></tbody>
            </table>
          </div>
        `

        var total_cols = 0

        class CustomTable extends HTMLElement {
            constructor() {
                console.clear()
                super()
                this._shadowRoot = this.attachShadow({ mode: 'open' })
                this._shadowRoot.appendChild(prepared.content.cloneNode(true))
                this._root = this._shadowRoot.getElementById('root')
                this._table = this._shadowRoot.getElementById('example')
                this._props = {}
                this.loadLibraries()
                this.render()
            }

            async loadLibraries() {
                var start = performance.now();
                // console.log(isLibAvail)
                if (!isLibAvail) {
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
                    isLibAvail = true
                }
                // console.log("----", DataTable)
                var end = performance.now();
                var time = end - start;
                console.log("Library took approx : "+(Math.round(time/1000, 2)).toString()+"s to load...")
            }
            
            // onCustomWidgetBeforeUpdate(changedProperties) {
            //   this._props = { ...this._props, ...changedProperties };
            // }

            // onCustomWidgetAfterUpdate(changedProperties) {
            // }

            // onCustomWidgetResize (width, height) {
            //   this.render()
            // }

            setResultSet(rs, col_to_row = -1, headers, customHeaderNames, selColumnName) {
                
                this._resultSet = [];
                // this._selectionColumnsCount = selCnt
                this._col_to_row = col_to_row // Row Grouping

                console.log(headers)
                var remove = headers["Exclude"].join(",")+",@MeasureDimension".split(",");

                this._dimensions = Array.from(new Set(Object.keys(rs[0]).filter((k) => !remove.includes(k))))
                this._measures = new Set()

                this._colOrder = headers["COL_NAME_ORDER"];
                this._scenarioOrder = headers["SCENARIO_ORDER"];
                this._fixedScenario = headers["FIXED_SCENARIO"];
                this._measureOrder = headers["@MeasureDimension"]
                this._excludeHeaders = headers['Exclude']
                this._dateColName = selColumnName; //selectionColumn
               
                this._customHeaderNames = customHeaderNames;

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

                // this.render();

            }

            applyStyling(table_css_styling, row_css_styling, col_css_styling) {
                this._tableCSS = table_css_styling
                this._rowCSS = row_css_styling
                this._colCSS = col_css_styling
                this.render()
            }

            async render() {
                
                if (!this._resultSet) {
                    return
                }

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
                } else if(this._colOrder.includes("Q") || this._colOrder.includes("Qtr") || this._colOrder.includes("Quarter") || this._colOrder.includes("Q1")) {

                } else {
                    for (var i = 0; i < col_dimension.length; i++) {
                        table_cols.push({
                            title: col_dimension[i]
                        })
                    }
    
                    for(var j = 0; j < this._colOrder.length; j++) {
                        table_cols.push({
                            title: this._colOrder[j]
                        })
                    }
                   
                    for(var i = this._fixedScenario.length; i < this._scenarioOrder.length; i++) {
                        if(this._scenarioOrder[i] != "FY") {
                            table_cols.push({
                                title: this._scenarioOrder[i]
                            })
                        }
                        for(var j = 0; j < this._colOrder.length; j++) {
                            table_cols.push({
                                title: this._colOrder[j]
                            })
                        }
                    }
                }
               
                // TRIM LOGIC
                // table_cols = table_cols.slice(0, this._dimensions.length - this._excludeHeaders.length + ((this._measureOrder.length + 1) * 3))
                console.log('Data Table Columns : ', table_cols)

                // --------------- Hide Columns STARTS ---------------
                var hideCols = []

                // @--------------- CHANGED UNCOMMENT THIS... ----------------------------------

                // for(var i = 19; i < table_cols.length; i++) {

                for(var i = 10; i < table_cols.length; i++) {
                    hideCols.push(i)
                }
                // --------------- Hide Columns ENDS ---------------

                // console.log('Data Table Columns : ', table_cols)

                var groupColumn = this._col_to_row

                var tbl = undefined
                if (groupColumn != -1) {

                    hideCols.push(groupColumn);
                    hideCols.push(2);

                    // var nullArr = table_cols.slice()
                    // nullArr.fill(null)
                    // nullArr.pop()
                    // console.log(nullArr)

                    tbl = new DataTable(this._table, {
                        layout: {},
                        columns: table_cols,
                        bAutoWidth: true, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                // targets: hideCols, //_all
                                // targets: groupColumn,
                                targets : hideCols,
                                // visible: false,
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
                        bAutoWidth: true, 
                        columnDefs: [
                            {
                                defaultContent: '-',
                                targets: hideCols, //_all
                                // visible:false
                                // className: 'dt-body-left'
                            }
                        ],
                        bPaginate: false,
                        searching: false,
                        ordering: false,
                        info: false,     // Showing 1 of N Entries...
                        bDestroy: true
                    })
                }

//  ------------------------------ TO BE UNCOMMENTED ----------------------
                // Top Most Header Block Starts
                var topHeader = "<tr>";
                
                if(groupColumn != -1) {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 3}'></th>`;
                } else {
                    topHeader += `<th class='top-header' colspan='${this._dimensions.slice(0, this._dimensions.length - this._excludeHeaders.length).length - 1}'></th>`;
                }
                // 
                // CHANGED TO -2 in loop condition for neglecting last two scenarios
                // 
                // for(var i = 0; i < this._scenarioOrder.length; i++) {
    
                for(var i = 0; i < this._scenarioOrder.length - 2; i++) {
                    if(this._fixedScenario.includes(this._scenarioOrder[i])) {
                        topHeader += `<th class='top-header' colspan='${this._measureOrder.length}'>${this._scenarioOrder[i]}</th>`
                    } else {
                        topHeader += 
                        `<th class='top-header' colspan='${this._measureOrder.length + 1}'>
                            <select id='${i}' class='scenarios' onchange='updateColumns(this, ${this._dimensions.length}, ${this._excludeHeaders.length}, ${this._measureOrder.length}, ${this._scenarioOrder.length - this._fixedScenario.length})'>`;
                            var opts = ""
                            for(var j = 0; j < this._scenarioOrder.length; j++) {
                                if(!this._fixedScenario.includes(this._scenarioOrder[j])) {
                                    if(this._scenarioOrder[i] == this._scenarioOrder[j]) {
                                        opts += `<option  id='${j}' selected>${this._scenarioOrder[j]}</option>`;
                                    } else {
                                        opts += `<option id='${j}' >${this._scenarioOrder[j]}</option>`;
                                    }
                                }
                            }
                        topHeader += opts + `</select>
                        </th>`
                    }
                }
                

                topHeader += "</tr>";

                // @--- uncomment below line
                // document.querySelector("monthly-custom-table").shadowRoot.querySelector("#example > thead").insertAdjacentHTML('afterBegin', topHeader);
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
                var fixRowsObj = {};
                const masterRows = [];
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
                
                function updateRow(state, no_of_dimens, no_of_mes, no_of_excludes, identifer, sliceFrom, changeLength) 
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
                    // var sliced = selOptVal.slice(no_of_dimens - no_of_excludes + no_of_mes, ), data = {};
                    var sliced = selOptVal.slice(sliceFrom, ), data = {};
                    console.log(sliced)


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
                        data[index] = sliced.slice(i, i + changeLength)
                        i += changeLength
                        index += 1
                    }
                    console.log("0000",data, data[selOptID])

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
                    for(var i = sliceLen, idx = 0; i < sliceLen + changeLength; i++) {
                        row_updated_arr[i] = dataCopy[idx]
                        idx += 1;
                    }

                    // console.log(row_updated_arr)
                    tbl.row('.selected').data(row_updated_arr)

                }

                window.updateRow = updateRow

                var dateName = new Set(), scenarioSeq = this._scenarioOrder.slice(1, );
                
                var obj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                // var masterObj = {};
                // var scenarioObj = Object.fromEntries(this._scenarioOrder.slice().map(key => [key, structuredClone(obj)]));
                // console.log(scenarioObj)
                var fixRows = this._resultSet[i].slice(0, fixedScenarioAt);
                // console.log("<><><><>", fixRows)

                for(var i = 0, prev_key = "", seqID = 0, scenarioMissing = false; i < this._resultSet.length;) {

                    // fixRows = fixRows.concat(this._resultSet[i].slice())
                    var key = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                    
                    if(i==0) {prev_key = key.substring(0, )}

                    var tempKey = key.substring(0, );
                    dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);

                    while(JSON.stringify(key) == JSON.stringify(tempKey)) {
                        // console.log(this._resultSet[i])
                        if(this._resultSet[i] == undefined) {
                            break;
                        }
                        tempKey = this._resultSet[i].slice(0, this._dimensions.indexOf(this._dateColName)).join("_#_");
                        // for(var j = 0; j < fixedScenarioAt; j++) {
                        //     tempKey += this._resultSet[i][j]+"_#_"
                        // }
                        // fixRows.splice(fixRows.length, 0, ...this._resultSet[i].slice(this._dimensions.length - 1, ))
                        if(JSON.stringify(key) != JSON.stringify(tempKey)) {
                            break;
                        }






                        // var masterKey = tempKey.split("_#_").slice(0, fixedScenarioAt);
                        // masterObj[masterKey.join("_#_")] = structuredClone(scenarioObj);
                        // masterObj[masterKey.join("_#_")][this._scenarioOrder[seqID]][this._resultSet[i].slice(this._dimensions.length - 1, )[0]] = this._resultSet[i].slice(this._dimensions.length - 1, )






                        console.log(this._scenarioOrder[seqID], "---", this._resultSet[i][fixedScenarioAt]) 

                        if(this._scenarioOrder[seqID] != this._resultSet[i][fixedScenarioAt]) {
                            for(var month = 0; month < this._colOrder.length; month++) {
                                obj[this._colOrder[month]] = []
                            }
                            // obj["NONE"] = ["NONE", "--Selection <> --"]
                            seqID++;
                        } else {
                            var scene = this._resultSet[i].slice(this._dimensions.length - 1, )[0];
                            obj[scene] = this._resultSet[i].slice(this._dimensions.length - 1, )
                        }

                        // if(seqID >= this._scenarioOrder.length) {
                        //     seqID = 0;
                        // }



                        // scenarioObj[this._resultSet[i][fixedScenarioAt]][scene] = 1
                       
    // console.log(tempKey, "KEYYYYYYY", key)
                        // console.log(scenarioSeq[seqID],"---", scene)
                        dateName.add(this._resultSet[i][this._dimensions.indexOf(this._dateColName)]);
                        i += 1;
                    }
                    // console.log(obj)
                    // console.log(scenarioObj)
                    
                    var check_KEY = key.split("_#_");
                    var compare_KEY = tempKey.split("_#_");
                    // console.log(check_KEY.slice(0, check_KEY.length - 1).join("_#_"), "---",compare_KEY.slice(0, compare_KEY.length - 1).join("_#_") )

                    // For Last Row / Record
                    if(this._resultSet[i + 1] == undefined) {
                        for(const [k, v] of Object.entries(structuredClone(obj))) {
                            if(v.length <= 0) {
                                fixRows.push("-")
                            } else {
                                fixRows.push(v[1])
                            }
                        }
                        // console.log(fixRows, "---", ">>>>", obj)
                    }

                    if(key != tempKey) {

                        seqID++;
                        if(seqID >= this._scenarioOrder.length) {
                            seqID = 0;
                        }

                        // console.log("OBJ", fixRows)
                        var cnt = 0;
                        for(const [k, v] of Object.entries(structuredClone(obj))) {
                            if(v.length <= 0) {
                                fixRows.push("-")
                            } else {
                                fixRows.push(v[1])
                            }
                            // console.log(cnt, "_#_", this._colOrder.length - 1)
                            if(cnt == this._colOrder.length - 1) {
                                fixRows.push("--Selection--")
                                cnt = 0;
                            }
                            cnt++;
                            // console.log(k, v)
                        }
                        console.log("OBJ1", fixRows)
                        var obj = Object.fromEntries(this._colOrder.slice().map(key => [key, []]));
                        var scene = this._resultSet[i].slice(this._dimensions.length - 1, )[0];
                        obj[scene] = this._resultSet[i].slice(this._dimensions.length - 1, )
                    }

                    if(check_KEY.slice(0, check_KEY.length - 1).join("_#_") != compare_KEY.slice(0, compare_KEY.length - 1).join("_#_")) {
                        // console.log("HELLO-----------------------")
                        // console.log(this._resultSet[i], "----", key, ">>>>",tempKey)
                        // console.log(fixRows);
                        if(table_cols.length != fixRows.length) {
                            // console.log(">>>>>>>>>>>>>>>",fixRows)
                            // for(var p = 0; p < this._colOrder.length; p++) {
                            //     fixRows.push("-")
                            // }
                            // fixRows.push("--Selection--")
                            // fixRows.pop()
                        }
                        

                        // fixRows.pop()
                        // console.log("))))", fixRows)
                    }
                   

                    // Final Assignment of fixRows
                    // console.log("HIIIII",this._resultSet[i] != undefined, fixRows.slice(0, fixedScenarioAt).join("_#_"), "---", this._resultSet[i].slice(0, fixedScenarioAt).join("_#_"))
                   
                    if(table_cols.length == fixRows.length) {
                        // seqID = 0;
                        var dateNameArr = Array.from(dateName);
                        // console.log("----",dateNameArr)
                        dateNameArr.shift()
                        // console.log("----",dateNameArr)
                        var sliceLen = this._colOrder.length + fixedScenarioAt;
                        var sliced = fixRows.slice(sliceLen)
                        // console.log(sliced, fixRows, "---------------")

                        for(var k = 0, optIdx = 0; k < sliced.length; k++) {
                            var select_html = `<select id='${k}' class='row_level_select' onchange='updateRow(this, ${this._dimensions.length}, ${this._measureOrder.length}, ${this._excludeHeaders.length}, "${fixRows[0]}_#_${fixRows[1]}", ${fixedScenarioAt + this._colOrder.length}, ${this._colOrder.length})'>`;
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
                            k += this._colOrder.length;
                            optIdx += 1;
                        }
                        // console.log(sliced)
                        fixRows = fixRows.slice(0, sliceLen).concat(sliced);
                        // console.log(fixRows,"-----")

                        fixRowsObj[fixRows[0]+"_#_"+fixRows[1]] = fixRows
                        masterRows.push(fixRows.slice());
                        tbl.row.add(fixRows).draw(false)
                        // fixRows = [];
                        if(this._resultSet[i] != undefined) {
                            fixRows = this._resultSet[i].slice(0, fixedScenarioAt);
                        } else {
                            fixRows = [];
                        }

                        // console.log(fixRows)
                    }

                    prev_key = key;

                }

                // Styling Block Starts
                if (this._tableCSS.length > 1) {
                    console.log(this._tableCSS)
                    this._table.style.cssText = this._tableCSS
                }

                if (this._rowCSS.length > 1) {
                    console.log(this._rowCSS)
                    document
                        .querySelector('monthly-custom-table')
                        .shadowRoot.querySelectorAll('td')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                    document
                        .querySelector('monthly-custom-table')
                        .shadowRoot.querySelectorAll('th')
                        .forEach(el => (el.style.cssText = this._rowCSS))
                }

                if (this._colCSS.length > 1) {
                    console.log(this._colCSS)
                    document
                        .querySelector('monthly-custom-table')
                        .shadowRoot.querySelector('style').innerText += this._colCSS
                }

                // Styling Block Ends here
            }
        }
        customElements.define('monthly-custom-table', CustomTable)
    })()
