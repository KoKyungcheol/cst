var contentsList;
var paramPgmList, paramPrjList, paramPastYearList, paramDeptList, paramCostTypeList, paramCostDivList, paramYearList, paramIsTypeList, paramIsStateList;

function zxCustomPageSetUp() {
    var qryOptions = {};

    getItems("ZX_DashboardContent", qryOptions, function(data) {
        //contentsList = '<div class="btn-group" style="width:20%;float:right;">' +
        contentsList = '<div class="btn-group" style="width:30%; margin-right:15px; float:right;">' +
            '<button class="btn dropdown-toggle btn-xs btn-warning" data-toggle="dropdown" style="float:right;">Contents   <i class="fa fa-caret-down"></i></button>' +
            '<ul class="dropdown-menu pull-right" style="height:320px; overflow:auto;">';

        for (var i = 0; i < data.length; i++) {
            contentsList += '<li onclick="zxContentsDrop(\'' + data[i].id + '\', \'cts_name\');">' + data[i]._content_name + '</li>';
        }
        contentsList += '</ul></div>@@searchCriteria@@';

        for (var j = 0; j < userContents.length; j++) {
            zxContentsDrop(userContents[j].contentsid, "cts0" + j, true);
        }
    });
}


//Drop 시 호출되는 함수
//cstId - Drag한 Object ID, trgId - Drop된 Object ID
function zxContentsDrop(ctsId, trgId, isFirst) {
    var idx = trgId.substring(trgId.length - 1, trgId.length);
    var cntHtml = contentsList;
    var prevContent;

    if (ctsId == "") { //User Contents Data가 없을 경우 Contents 선택 Combo만 생성 후 Return
        cntHtml = cntHtml.replace('@@searchCriteria@@', ""); //추가 검색 조건 Setting
        $("#" + trgId + "_box").html(cntHtml.replace(/cts_name/gi, trgId)); //Contents 선택 List 추가
        return;
    }

    if ($.isNumeric(idx)) { //Contents 선택 영역 Check
        prevContent = userContents[idx].contentsid;
        userContents[idx].contentsid = ctsId;
    } else {
        return;
    }

    var typeDef;

    if (typeof objDef["type" + ctsId] === "object") {
        typeDef = objDef["type" + ctsId];
    } else {
        alert("Not a object");
    }

    //Contents 변경 없이 Resize만 된 경우 조회 조건 유지를 위해..
    if (prevContent != ctsId || isFirst) {
        cntHtml = cntHtml.replace('@@searchCriteria@@', zxAddSearchCriteria(idx, typeDef)); //추가 검색 조건 Setting
        $("#" + trgId + "_box").html(cntHtml.replace(/cts_name/gi, trgId)); //Contents 선택 List 추가

        /*
        	LeeJH 2020
        //User Contents Save
        var sendMethod, sendURL;

        if (userContents[idx].id == "") {
        	sendMethod = "POST";
        	sendURL = aras.getServerBaseURL() + "odata/ZX_Identity_DashboardContents";
        } else {
        	sendMethod = "PATCH";
        	sendURL = aras.getServerBaseURL() + "odata/ZX_Identity_DashboardContents('" + userContents[idx].id + "')";
        }
        $.ajax({
        	method: sendMethod,
        	url: sendURL,
        	headers: {
        		DATABASE: aras.getDatabase(),
        		AUTHUSER: aras.getLoginName(),
        		AUTHPASSWORD: aras.getPassword(),
        	},
        	data: JSON.stringify({
        		source_id : identityID,
        		related_id : ctsId,
        		_criteria_0 : (isFirst ? userContents[idx]["_criteria_0"] : ""),	_criteria_1 : (isFirst ? userContents[idx]["_criteria_1"] : ""),
        		_criteria_2 : (isFirst ? userContents[idx]["_criteria_2"] : ""),	_criteria_3 : (isFirst ? userContents[idx]["_criteria_3"] : ""),
        		_criteria_4 : (isFirst ? userContents[idx]["_criteria_4"] : ""),	_criteria_5 : (isFirst ? userContents[idx]["_criteria_5"] : ""),
        		_criteria_6 : (isFirst ? userContents[idx]["_criteria_6"] : ""),	_criteria_7 : (isFirst ? userContents[idx]["_criteria_7"] : ""),
        		_criteria_8 : (isFirst ? userContents[idx]["_criteria_8"] : ""),	_criteria_9 : (isFirst ? userContents[idx]["_criteria_9"] : ""),
        		sort_order : idx
        	}),
        	contentType: "application/json",
        	dataType: "json",
        }).fail(function(xhr, status, errorThrown) {
        	alert("오류가 발생했습니다 : " + errorThrown + ", " + status + ", Identity : " + identityID + ", Contents ID : " + ctsId);
        });
		
        LeeJH 2020 */

    }

    //typeDef["_caption"] = typeDef["caption"].substring(0, (typeDef["caption"].indexOf("(") < 0 ? typeDef["caption"].length : typeDef["caption"].indexOf("(")));	
    $("#" + trgId + "_caption").html(typeDef["_caption"]);
    $("#" + trgId + "_id").val(ctsId);


    if (typeDef["_content_type"] == "MultiBarLineChart") {
        zxMultiBarLineChartInit(trgId, typeDef);
        zxGetJsonData(typeDef["_method_name"], trgId);

    } else if (typeDef["_content_type"] == "PieChart") {
        zxPieChartInit(trgId, typeDef);
        zxGetJsonData(typeDef["_method_name"], trgId);

    } else if (typeDef["_content_type"] == "GanttChart") {
        zxGanttChartInit(trgId, typeDef);
        zxGetJsonData(typeDef["_method_name"], trgId);


    } else if (typeDef["_content_type"] == "MultiHeaderTable") {
        zxMultiHeaderTableInit(trgId, typeDef);
        zxGetJsonData(typeDef["_method_name"], trgId);

    } else if (typeDef["_content_type"] == "UserDefineChart" && typeDef["methodName"].substring(0, 3) == "ZX_") {
        zxGetJsonData(typeDef["methodName"], trgId);


    } else if (typeDef["_content_type"] == "UserDefineChart") {
        zxUserDefineChartTemp(trgId, typeDef);
    }
}

//사용할 데이터를 가져오는 임시 함수
//실제 프로그램에서는 AJAX 호출을 통해 데이터 처리할 예정
function zxGetJsonData(methodName, trgId) {
    var idx = trgId.substring(trgId.length - 1, trgId.length);
    var objCond = userContents[idx];
    var params = { dataDiv: methodName };
    var condition = "";

    for (var i = 0; i < 10; i++) {
        params["arg" + i] = (objCond["_criteria_" + i] == "ALL" ? "" : objCond["_criteria_" + i]);
    }

    invokeMethod("ZX_GetDataForDashboard", JSON.stringify(params), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        //var items = result ? result.Item : [];  //SQL을 사용한 Method에서 Data가 하나도 없을 경우 Item Key 자체가 없음
        var items = result ? result.Item.Item : [];

        if (!Array.isArray(items)) {
            items = [items];
        }

        zxChartSetData(trgId, items);
    });

}


function zxGetUserConfigure() {
    /*
    LeeJH 2020
    var params = JSON.stringify({dataDiv : "UserContents", userID : aras.getCurrentUserID()});
	
    invokeMethod("ZX_GetDataForDashboard", params, function (data) {
    	var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
    	var items = result ? result.Item : [];  

    	if (items.length == 0) {
    		userContents = [{"no":"1", "id": "", "contentsid":""},
    						{"no":"2", "id": "", "contentsid":""},
    						{"no":"3", "id": "", "contentsid":""},
    						{"no":"4", "id": "", "contentsid":""}];
    	} else {
    		userContents = items;
    	}
    }, function() {alert("User Config Error");});
    */
    userContents = [{
            "no": "1",
            "id": "01",
            "contentsid": "T11"
        },
        {
            "no": "2",
            "id": "02",
            "contentsid": "T40"
        },
        {
            "no": "3",
            "id": "03",
            "contentsid": "T74"
        },
        {
            "no": "4",
            "id": "04",
            "contentsid": "T92"
        }

    ];
    /* LeeJH 2020 */

    //Contents Definition 정보 조회
    //getItems("ZX_DashboardContent?$expand=ZX_DashboardContent_Series,ZX_DashboardContent_ValueAxe,ZX_DashboardContent_Params", {}, function(dat) {
    getItems("ZX_DashboardContent2", {}, function(dat) {
        for (var i = 0; i < dat.length; i++) {
            objDef["type" + dat[i].id] = dat[i];
        }
    }, function() { alert("Contents Config Error"); });

    //조건 List Data 조회
    invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "IssueState", userID: aras.getCurrentUserID() }), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        paramIsStateList = result ? result.Item : [];
    }, function() { alert("Issue State List Searching Error"); });

    invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "IssueType", userID: aras.getCurrentUserID() }), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        paramIsTypeList = result ? result.Item : [];
    }, function() { alert("Issue Type List Searching Error"); });

    invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "Department", userID: aras.getCurrentUserID() }), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        paramDeptList = result ? result.Item : [];
    }, function() { alert("Department List Searching Error"); });

    invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "CostType", userID: aras.getCurrentUserID() }), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        paramCostTypeList = result ? result.Item : [];
    }, function() { alert("CostType List Searching Error"); });

    invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "CostDiv", userID: aras.getCurrentUserID() }), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        paramCostDivList = result ? result.Item : [];
    }, function() { alert("CostDiv List Searching Error"); });

    invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "Year", userID: aras.getCurrentUserID() }), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        paramYearList = result ? result.Item : [];
    }, function() { alert("Year List Searching Error"); });

    invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "PastYear", userID: aras.getCurrentUserID() }), function(data) {
        var result = data;
        //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
        paramPastYearList = result ? result.Item : [];

        invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "Program", userID: aras.getCurrentUserID() }), function(data) {
            var result = data;
            //var result = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
            paramPgmList = result ? result.Item : [];

            invokeMethod("ZX_ParamListForDashboard", JSON.stringify({ dataDiv: "Project", userID: aras.getCurrentUserID() }), function(data) {
                var res = data;
                //var res = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["ApplyItemResponse"]["Result"];
                paramPrjList = res ? res.Item : [];
                zxCustomPageSetUp();
            }, function() { alert("Project List Searching Error"); });

        }, function(e) { alert("Program List Searching Error"); });

    }, function() { alert("Past Year List Searching Error"); });

}

//sArr안에 Object 데이터 중 sKey에 해당하는 값들로 중복 없는 배열을 만들어 리턴하는 함수
function zxGetMergedList(sArr, sKey) {
    var rArr = [];

    for (var i = 0; i < sArr.length; i++) {
        if (rArr.indexOf(sArr[i][sKey]) < 0) {
            rArr.push(sArr[i][sKey]);
        }
    }
    return rArr;
}


//Contents 영역 초기화
function zxInitContentsArea(trgId) {
    var elmt = document.getElementById(trgId + "_body");

    while (elmt.hasChildNodes()) {
        elmt.removeChild(elmt.firstChild);
    }
    if (chartObj[trgId] && chartObj[trgId].className != "DataTable") {
        chartObj[trgId].dispose();
    }

    var div = document.createElement("div");
    div.setAttribute("id", trgId + "_ContentsArea");
    div.style.height = (document.getElementById(trgId + "_body").offsetHeight - 15) + "px";
    div.style.width = "98%";
    document.getElementById(trgId + "_body").appendChild(div);
}


function zxChartSetData(cts, data) {
    if (chartObj[cts].className == "DataTable") {
        var arrCol = chartObj[cts]["columns"];
        var dataSet1 = [];

        for (var i = 0; i < data.length; i++) {
            var arrDat = [];
            for (var j = 0; j < arrCol.length; j++) {
                arrDat[j] = data[i][arrCol[j]._column];
            }
            dataSet1[i] = arrDat;
        }
        $("#" + cts + "_DataTable").dataTable({
            "sDom": "<'dt-toolbar'" +
                "t" +
                "<'dt-toolbar-footer'<'col-sm-6 col-xs-12 hidden-xs'i><'col-xs-12 col-sm-6'p>>",
            "autoWidth": true,
            "scrollX": true,
            "scrollY": true,
            data: dataSet1
                // ,
                // "columnDefs": [
                // {"targets": hiddenCol,"visible": false},
                // {"className": "align-right", "targets": alignRCol}
                //]
        });
    } else {
        if (chartObj[cts].series_type == "change") { //Series가 유동적일 경우..
            var seriesCol = chartObj[cts].series_column;
            var arrSeries = zxGetMergedList(data, seriesCol);
            var inverseYn = (chartObj[cts].xAxes.values[0].dataFields.category ? "N" : "Y");
            var categoryCol = (inverseYn == "N" ? chartObj[cts].xAxes.values[0].dataFields.category : chartObj[cts].yAxes.values[0].dataFields.category);
            var arrData = [],
                idx = 0,
                prevCate = "",
                objData = {};
            var totalLine = false;
            var totalSeries;

            //Data 재구성
            for (var i = 0; i < data.length; i++) {
                if (i == 0) { prevCate = data[i][categoryCol]; }

                if (data[i][categoryCol] != prevCate) {
                    arrData[idx] = objData;
                    objData = {};
                    prevCate = data[i][categoryCol];
                    idx++;
                }

                objData[categoryCol] = data[i][categoryCol];
                objData[data[i][seriesCol]] = data[i][chartObj[cts].series_value];

                if (objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id == "CONTENTS_210") {
                    objData[data[i][seriesCol] + "_per"] = data[i]["_per"];
                }
            }

            if (objData[categoryCol] == prevCate) {
                arrData[idx] = objData;
            }

            for (var i = chartObj[cts].series._values.length; i > 0; i--) { chartObj[cts].series.removeIndex(0).dispose(); }

            for (var i = 0; i < arrSeries.length; i++) {
                var series;

                if (objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id == "CONTENTS_230" && arrSeries[i] == "총계") {
                    totalLine = true;
                    totalSeries = arrSeries[i];
                    continue;
                } else {
                    series = chartObj[cts].series.push(new am4charts.ColumnSeries());
                    series.stacked = (i == 0 ? false : true);
                }

                if (inverseYn == "Y") {
                    series.dataFields.valueX = arrSeries[i];
                    series.dataFields.categoryY = categoryCol;

                    if (objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id == "CONTENTS_210") {
                        series.dataFields["_per"] = arrSeries[i] + "_per";
                        series.columns.template.tooltipText = "{name}: [bold]{valueX}({_per})[/]";

                        series.events.on("over", function(ev) {
                            chartObj[cts].series.each(function(series) {
                                if (ev.target.name == series.name) {
                                    series.showTooltipOn = "always";
                                    for (var i = 0; i < series.columns._values.length; i++) {
                                        series.columns._values[i].showTooltipOn = "always";
                                    }
                                } else {
                                    series.showTooltipOn = "hover";
                                    series.hideTooltip();
                                    for (var i = 0; i < series.columns._values.length; i++) {
                                        series.columns._values[i].showTooltipOn = "hover";
                                        series.columns._values[i].hideTooltip();
                                    }
                                }
                            });
                        });
                        series.events.on("out", function(ev) {
                            chartObj[cts].series.each(function(series) {
                                series.showTooltipOn = "hover";
                                series.hideTooltip();
                                for (var i = 0; i < series.columns._values.length; i++) {
                                    series.columns._values[i].showTooltipOn = "hover";
                                    series.columns._values[i].hideTooltip();
                                }
                            });
                        });

                    } else {
                        series.columns.template.tooltipText = "{name}: [bold]{valueX}[/]";
                    }
                } else {
                    series.dataFields.valueY = arrSeries[i];
                    series.dataFields.categoryX = categoryCol;
                    series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";

                    if (i == 0 && objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id != "CONTENTS_230") {
                        series.columns.template.column.cornerRadiusTopLeft = 10;
                        series.columns.template.column.cornerRadiusTopRight = 10;
                    } else {
                        series.columns.template.column.adapter.add("cornerRadiusTopLeft", cornerRadius);
                        series.columns.template.column.adapter.add("cornerRadiusTopRight", cornerRadius);
                    }
                }
                series.name = arrSeries[i];
                //series.fill = colorTable[i];
                if (series._className == "ColumnSeries") {
                    series.columns.template.width = am4core.percent(95);
                }
                series.cursorTooltipEnabled = false;
            }

            //총계를 Line으로 표시하기 위해 추가한 부분 
            if (totalLine) {
                var series = chartObj[cts].series.push(new am4charts.LineSeries());
                series.dataFields.valueY = totalSeries;
                series.dataFields.categoryX = categoryCol;
                series.name = totalSeries;
                var bullet = series.bullets.push(new am4charts.CircleBullet());
                bullet.tooltipText = "{name}: [bold]{valueY}[/]";
            }

            function cornerRadius(radius, item) {
                let dataItem = item.dataItem;

                // Find the last series in this stack
                let lastSeries;
                chartObj[cts].series.each(function(series) {
                    if (dataItem.dataContext[series.dataFields.valueY] != 0 && dataItem.dataContext[series.dataFields.valueY] && !series.isHidden && !series.isHiding && series._className != "LineSeries") {
                        lastSeries = series;
                    }
                });
                // If current series is the one, use rounded corner
                return dataItem.component == lastSeries ? 10 : radius;
            }

            chartObj[cts].data = arrData;
        } else {
            chartObj[cts].data = data;
        }
    }

    //chartObj["cts02"].seriesContainer.children.values[0].text
    //chartObj["cts02"].className


}


//***********************************************//
//zxMultiBarLineChartInit
function zxMultiBarLineChartInit(cts, typeDef) {
    zxInitContentsArea(cts);
    am4core.options.commercialLicense = true;
    //am4core.useTheme(am4themes_dataviz);
    //am4core.useTheme(am4themes_frozen);
    am4core.useTheme(am4themes_animated);
    chartObj[cts] = am4core.create(cts + "_ContentsArea", am4charts.XYChart);

    function cornerRadius(radius, item) {
        let dataItem = item.dataItem;

        // Find the last series in this stack
        let lastSeries;
        chartObj[cts].series.each(function(series) {
            if (dataItem.dataContext[series.dataFields.valueY] != 0 && dataItem.dataContext[series.dataFields.valueY] && !series.isHidden && !series.isHiding && series._className != "LineSeries") {
                lastSeries = series;
            }
        });

        // If current series is the one, use rounded corner
        return dataItem.component == lastSeries ? 10 : radius;
    }

    function zxGetToolTip(tooltip, item) {
        var ret = "";
        chartObj[cts].series.each(function(series) {
            if (item.virtualParent.name.substring(3, item.virtualParent.name.length) == series.name.substring(3, series.name.length)) {
                //if (item.virtualParent.name.substring(0, 1) == series.name.substring(0, 1)) {
                var val = item.dataItem.dataContext[series.dataFields.valueX + "2"];
                ret += series.name + " : " + (val ? val : "0") + "\n";
            }
        });
        return ret;
    }

    //Create Axes
    var categoryAxis;

    if (typeDef.hasOwnProperty("_inverse_yn") && typeDef["_inverse_yn"] == 1) {
        categoryAxis = chartObj[cts].yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.renderer.inversed = true;
    } else {
        categoryAxis = chartObj[cts].xAxes.push(new am4charts.CategoryAxis());
    }

    categoryAxis.dataFields.category = typeDef._category_column;
    //categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 50;
    categoryAxis.renderer.cellStartLocation = 0.1;
    categoryAxis.renderer.cellEndLocation = 0.9;

    if (typeDef.hasOwnProperty("_category_min_period")) {
        categoryAxis.dateFormatter.dateFormat = typeDef._category_min_period;
    }

    var arrValue = typeDef.ZX_DashboardContent_ValueAxe;
    var valueAxis = new Array();

    if (arrValue.length > 0) {
        for (var i = 0; i < arrValue.length; i++) {
            if (typeDef.hasOwnProperty("_inverse_yn") && typeDef["_inverse_yn"] == 1) {
                valueAxis[i] = chartObj[cts].xAxes.push(new am4charts.ValueAxis());
            } else {
                valueAxis[i] = chartObj[cts].yAxes.push(new am4charts.ValueAxis());
            }

            if (arrValue[i]._position == "right") {
                valueAxis[i].renderer.opposite = true;
            }
            if (arrValue[i].hasOwnProperty("_minimum")) {
                valueAxis[i].min = arrValue[i]._minimum;
            }
            if (arrValue[i].hasOwnProperty("_maximum")) {
                valueAxis[i].max = arrValue[i]._maximum;
                valueAxis[i].strictMinMax = true;
            }
            if (arrValue[i].hasOwnProperty("_title")) {
                valueAxis[i].title.text = arrValue[i]._title;
            }
            if (i > 0) {
                valueAxis[i].renderer.grid.template.disabled = true;
            }
            //valueAxis[i].cursorTooltipEnabled = true;
        }
    } else {
        var valueAxis = chartObj[cts].yAxes.push(new am4charts.ValueAxis());
        //valueAxis.min = 0;
        //valueAxis.cursorTooltipEnabled = true;
    }


    var arrSerires = typeDef.ZX_DashboardContent_Series;
    var barCount = (typeDef.hasOwnProperty("_bar_column_count") ? typeDef._bar_column_count : -1);

    chartObj[cts].series_type = typeDef._series_type;
    chartObj[cts].series_column = arrSerires.length > 0 ? arrSerires[0]._column : "";
    chartObj[cts].series_value = typeDef._json_data_key;

    for (var i = 0; i < arrSerires.length; i++) {
        if (barCount > 0 && i < barCount) {
            var series = chartObj[cts].series.push(new am4charts.ColumnSeries());

            if (typeDef.hasOwnProperty("_inverse_yn") && typeDef["_inverse_yn"] == 1) {
                series.dataFields.valueX = arrSerires[i]._column;
                series.dataFields.categoryY = typeDef._category_column;
                series.name = arrSerires[i]._name;
                series.columns.template.tooltipText = "{name}: [bold]{valueX}[/]";
                series.columns.template.height = am4core.percent(98);

            } else {
                series.dataFields.valueY = arrSerires[i]._column;
                series.dataFields.categoryX = typeDef._category_column;
                series.name = arrSerires[i]._name;
                //series.fill = colorTable[i];
                series.columns.template.tooltipText = "{name}: [bold]{valueY}[/]";
                series.stacked = (i == 0 ? false : (arrSerires[i]._new_stack == "1" ? false : true));
                series.columns.template.width = am4core.percent(95);

                if (i == 0 && objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id != "CONTENTS_170" &&
                    objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id != "CONTENTS_010") {
                    series.columns.template.column.cornerRadiusTopLeft = 10;
                    series.columns.template.column.cornerRadiusTopRight = 10;
                } else if (i == 1 && objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id == "CONTENTS_130") {
                    series.columns.template.column.cornerRadiusTopLeft = 10;
                    series.columns.template.column.cornerRadiusTopRight = 10;
                } else {
                    series.columns.template.column.adapter.add("cornerRadiusTopLeft", cornerRadius);
                    series.columns.template.column.adapter.add("cornerRadiusTopRight", cornerRadius);
                }
            }

            if (arrSerires[i].hasOwnProperty("_color") && arrSerires[i]["_color"] > "" && arrSerires[i]["_color"] != "#ffffff") {
                series.columns.template.fill = arrSerires[i]["_color"];
                series.columns.template.stroke = arrSerires[i]["_color"];
            }

            series.cursorTooltipEnabled = false;
            series.stacked = (i == 0 ? false : (arrSerires[i]._new_stack == "1" ? false : true));


            if (objDef["type" + userContents[cts.substr(cts.length - 1, 1) * 1].contentsid]._content_id == "CONTENTS_125") {
                if (i > 0 && i % 3 != 0) {
                    series.clustered = false;
                    series.columns.template.height = am4core.percent(100 - ((i % 3) * 40));
                }

                series.columns.template.adapter.add("tooltipText", zxGetToolTip);
            }

        } else {
            var series = chartObj[cts].series.push(new am4charts.LineSeries());
            series.dataFields.valueY = arrSerires[i]._column;
            series.dataFields.categoryX = typeDef._category_column;
            series.name = arrSerires[i]._name;

            var bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.tooltipText = "{name}: [bold]{valueY}[/]";


            if (arrSerires[i].hasOwnProperty("_color") && arrSerires[i]["_color"] > "" && arrSerires[i]["_color"] != "#ffffff") {
                series.fill = arrSerires[i]["_color"];
                series.stroke = arrSerires[i]["_color"];
            }


            if (arrSerires[i]._value_axe_index > 0) { series.yAxis = valueAxis[arrSerires[i]._value_axe_index]; }
            series.hidden = false;
        }
    }

    chartObj[cts].cursor = new am4charts.XYCursor();
    chartObj[cts].cursor.lineY.disabled = true;
    chartObj[cts].cursor.lineX.disabled = true;

    if (arrSerires.length < 12 || isFullScreen) {
        chartObj[cts].legend = new am4charts.Legend();
        chartObj[cts].legend.fontSize = "12";
    }
}


//zxPieChartInit
function zxPieChartInit(cts, typeDef) {
    zxInitContentsArea(cts);

    //am4core.useTheme(am4themes_kelly);
    am4core.useTheme(am4themes_animated);
    chartObj[cts] = am4core.create(cts + "_ContentsArea", am4charts.PieChart);
    chartObj[cts].innerRadius = am4core.percent(30);

    //Add Label
    var label = chartObj[cts].seriesContainer.createChild(am4core.Label);
    label.text = "";
    label.horizontalCenter = "middle";
    label.verticalCenter = "middle";
    label.fontSize = 30;

    //Add and Configure Series
    var pieSeries = chartObj[cts].series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = typeDef._json_data_key;
    pieSeries.dataFields.category = typeDef._category_column;
}


//zxGanttChartInit - Data는 category, start, end, color, task 항목 필수
function zxGanttChartInit(cts, typeDef) {
    zxInitContentsArea(cts);

    am4core.useTheme(am4themes_animated);
    chartObj[cts] = am4core.create(cts + "_ContentsArea", am4charts.XYChart);
    //chartObj[cts].hiddenState.properties.opacity = 0;

    chartObj[cts].paddingRight = 30;

    var colorSet = new am4core.ColorSet();
    colorSet.saturation = 0.4;

    //chartObj[cts].dateFormatter.dateFormat = "yyyy-MM-dd";
    //chartObj[cts].dateFormatter.inputDateFormat = "yyyy-MM-dd";

    var categoryAxis = chartObj[cts].yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "_category";
    //categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;

    var dateAxis = chartObj[cts].xAxes.push(new am4charts.DateAxis());
    //dateAxis.renderer.minGridDistance = 70;
    dateAxis.baseInterval = { count: 1, timeUnit: "day" };
    //dateAxis.max = new Date(2019, 0, 1, 24, 0, 0, 0).getTime();
    //dateAxis.strictMinMax = true;
    dateAxis.renderer.tooltipLocation = 0;

    var series1 = chartObj[cts].series.push(new am4charts.ColumnSeries());
    series1.columns.template.height = am4core.percent(50);
    series1.columns.template.tooltipText = "{task}: [bold]{openDateX}[/] - [bold]{dateX}[/]";

    series1.dataFields.openDateX = "_start";
    series1.dataFields.dateX = "_end";
    series1.dataFields.categoryY = "_category";
    series1.columns.template.propertyFields.fill = "_color"; // get color from data
    series1.columns.template.propertyFields.stroke = "_color";
    series1.columns.template.strokeOpacity = 1;

    chartObj[cts].scrollbarX = new am4core.Scrollbar();
}



//zxMultiHeaderTableInit(cts, typeDef)
function zxMultiHeaderTableInit(cts, typeDef) {
    zxInitContentsArea(cts);
    chartObj[cts] = {};

    // Header Setup
    var tTab = document.createElement("table");
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    var arrCol = typeDef.ZX_DashboardContent_Series;
    var dataColIdx = 0; //실제 Data와 연결되어 있는 Column들의 Index

    for (var i = 0; i < arrCol.length; i++) {
        // if (arrCol[i].level * 1 != prevLevel) {
        // if (prevLevel != 0) {
        // thead.appendChild(tr);
        // tr = document.createElement("tr");
        // }
        // prevLevel = arrCol[i].level;
        // }
        var thElmt = document.createElement("th");
        //thElmt.className = "info";
        thElmt.style.backgroundColor = "lightgray";
        var thText = document.createTextNode(arrCol[i]._name);
        // thElmt.rowSpan = arrCol[i].rowspan;
        // thElmt.colSpan = arrCol[i].colspan;
        thElmt.appendChild(thText);
        tr.appendChild(thElmt);

        // if (arrCol[i].hidden == "Y") {
        // hiddenCol[hiddenIdx++] = dataColIdx;
        // }
        // if (arrCol[i].halign == "right") {
        // alignRCol[alignRIdx++] = dataColIdx;
        // }

        //if (arrCol[i].colid > " ") {
        dataColIdx++;
        //}
    }

    thead.appendChild(tr);
    tTab.setAttribute("id", cts + "_DataTable");
    tTab.setAttribute("width", "100%");
    tTab.className = "table table-striped table-bordered table-hover";
    tTab.appendChild(thead);
    document.getElementById(cts + "_ContentsArea").appendChild(tTab);
    document.getElementById(cts + "_ContentsArea").style.overflow = "auto";

    chartObj[cts]["className"] = "DataTable";
    chartObj[cts]["columns"] = arrCol;

}


//zxUserDefineChart(trgId, typeDef);
function zxUserDefineChart(cts, typeDef, jsonData) {
    var elmt = document.getElementById(cts + "_body");
    while (elmt.hasChildNodes()) {
        elmt.removeChild(elmt.firstChild);
    }

    var div = document.createElement("div");
    div.setAttribute("id", cts + "_UserDefineChart");
    //div.style.height = "95%";
    div.style.height = (document.getElementById(cts + "_body").offsetHeight - 15) + "px";
    div.style.width = "95%";

    document.getElementById(cts + "_body").appendChild(div);
    AmCharts.makeChart(cts + "_UserDefineChart", jsonData);
}


function zxUserDefineChartTemp(trgId, typeDef) {
    var jsonData = zxGetJsonData(typeDef["methodName"]);

    var elmt = document.getElementById(trgId + "_body");
    while (elmt.hasChildNodes()) {
        elmt.removeChild(elmt.firstChild);
    }

    var div = document.createElement("div");
    div.setAttribute("id", trgId + "_UserDefineChart");
    //div.style.height = "95%";
    div.style.height = (document.getElementById(trgId + "_body").offsetHeight - 15) + "px";
    div.style.width = "95%";

    document.getElementById(trgId + "_body").appendChild(div);
    //console.warn(jsonData);
    AmCharts.makeChart(trgId + "_UserDefineChart", jsonData);
}



function zxAddSearchCriteria(idx, typeDef) {
    var params = typeDef.ZX_DashboardContent_Params || []; //Contents의 Param 목록
    var rtHtml = '';
    var tlHtml = '<div class="btn-group" style="margin-right:10px;">' +
        '<button id="@@btnId@@" class="btn dropdown-toggle btn-xs btn-warning" data-toggle="dropdown" data-toggle="tooltip" data-placement="top" @@tooltip_title@@>@@cName@@' +
        '<i class="fa fa-caret-down"></i></button>';

    for (var i = 0; i < params.length; i++) {
        var arrData, paramName;

        if (params[i]._param_type == "PROGRAM") {
            arrData = paramPgmList;
            paramName = "과  제    ";
        } else if (params[i]._param_type == "PROJECT") {
            arrData = paramPrjList;
            paramName = "과제/세부과제 ";
        } else if (params[i]._param_type == "PASTYEAR") {
            arrData = paramPastYearList;
            paramName = "년  도    ";
        } else if (params[i]._param_type == "DEPART") {
            arrData = paramDeptList;
            paramName = "팀 / 부  서    ";
        } else if (params[i]._param_type == "COSTTYPE") {
            arrData = paramCostTypeList;
            paramName = "직접비/간접비";
        } else if (params[i]._param_type == "COSTDIV") {
            arrData = paramCostDivList;
            paramName = "비용항목";
        } else if (params[i]._param_type == "ALLYEAR") {
            arrData = paramYearList;
            paramName = "년  도  ";
        } else if (params[i]._param_type == "IS_TYPE") {
            arrData = paramIsTypeList;
            paramName = "이슈 유형";
        } else if (params[i]._param_type == "IS_STATE") {
            arrData = paramIsStateList;
            paramName = "이슈 상태";
        }

        var addHtml = tlHtml.replace('@@cName@@', paramName).replace('@@btnId@@', 'btn_' + idx + '_' + i) + '<ul class="dropdown-menu pull-left">';

        for (var j = 0; j < arrData.length; j++) {
            addHtml += '<li onclick="zxSetSearchCriteria(' + idx + ', ' + i + ', \'' + arrData[j].id + '\', \'' + arrData[j].name + '\')">' + arrData[j].name + '</li>';

            //사용자 정보에 조회 조건이 있으면 Default Setting
            if (userContents[idx]["_criteria_" + i] == arrData[j].id) {
                addHtml = addHtml.replace("@@tooltip_title@@", "title='" + arrData[j].name + "'");
            }
        }
        addHtml = addHtml.replace("@@tooltip_title@@", "");
        addHtml += '</ul></div>';
        rtHtml += addHtml;
    }
    return rtHtml; // + "</div>";
}

function zxSetSearchCriteria(idx, key, value, name) {
    var typeDef = objDef["type" + $("#cts0" + idx + "_id").val()];
    userContents[idx]["_criteria_" + key] = value;
    document.getElementById("btn_" + idx + "_" + key).title = name;
    /*
    $.ajax({
        method: "PATCH",
        url: aras.getServerBaseURL() + "odata/ZX_Identity_DashboardContents('" + userContents[idx].id + "')",
        headers: {
            DATABASE: aras.getDatabase(),
            AUTHUSER: aras.getLoginName(),
            AUTHPASSWORD: aras.getPassword(),
        },
        data: JSON.stringify({
            _criteria_0: userContents[idx]["_criteria_0"],
            _criteria_1: userContents[idx]["_criteria_1"],
            _criteria_2: userContents[idx]["_criteria_2"],
            _criteria_3: userContents[idx]["_criteria_3"],
            _criteria_4: userContents[idx]["_criteria_4"],
            _criteria_5: userContents[idx]["_criteria_5"],
            _criteria_6: userContents[idx]["_criteria_6"],
            _criteria_7: userContents[idx]["_criteria_7"],
            _criteria_8: userContents[idx]["_criteria_8"],
            _criteria_9: userContents[idx]["_criteria_9"]
        }),
        contentType: "application/json",
        dataType: "json",
    });
    */
    zxGetJsonData(typeDef["_method_name"], "cts0" + idx);
}