
/**rwm API host and port**/
var nodeJsHost = 'localhost';
var nodeJsPort = '3000';

/**Redis Host,Port and database id to send to all requestes to rwm API**/
var redisHostPort = new Object();
redisHostPort.host = 'localhost';
redisHostPort.port = '6379';
redisHostPort.db = 0;

var activeKey = null;
var activeKeyType = null;

/**To change activer key and it's type(active key is a key which is currenlty displayed in display div)**/
function changeActiveKey(key,keyType){
	activeKey = key;
	activeKeyType = keyType;
}

/**Fetch all keys of given database id from rwm API**/

function fetchKeys(dbid){

/**Initially set activer key and it's type as null**/
	changeActiveKey(null,null);

	/**Hide internal buttons which will be shown when any key's value will be displayed**/
	$(".internalButtonsClass").hide();
	$(".externalButtonsClass").show();

	var regexForIP = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
	redisHostPort.host = $("#host").val();
	if (regexForIP.test(redisHostPort.host) == false && redisHostPort.host != "localhost") {
					showDialogBox("Error","Only IP or localhost is allowed in host textbox.",false);
					return;
	}
	redisHostPort.port = $("#port").val();
	redisHostPort.password = $("#auth").val();
	if(dbid != undefined)
		redisHostPort.db = dbid;
	if($("#host").val() == undefined || $("#host").val() == '')
		showDialogBox("Error","Please enter Redis server host",false);
	else if($("#port").val() == undefined || $("#port").val() == '')
		showDialogBox("Error","Please enter Redis server port",false);
	else{
			$.ajax({
		 url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/connect',
			data: redisHostPort,
			type: 'POST',
			success: function (data) {
		if(!data.errno)
		{
		$("#allKeyDivId").html('');
		$("#valueTableDivId").html('');
		$("#valueTextDivId").html('');
		$('#singleValueDisplayDivId').html('');
		if(Array.isArray(data))
		{
			data.sort().forEach(function(element) {
				var imgDelete = $('<img>').addClass('small_icon').attr('src', '/img/delete_button.png');
				var imgReload = $('<img>').addClass('small_icon').attr('src', '/img/load_button.png');
				var imgRename = $('<img>').addClass('small_icon').attr('src', '/img/edit_button.png');
				var deleteButton = $('<button/>').addClass('btn_in_keyName').attr('title','Delete Key').bind("click",function(){
					showIsDeleteDialog(element);
				}).append(imgDelete);
				var reloadButtonInternal = $('<button/>').addClass('btn_in_keyName').attr('title','Reload Key').bind("click",function(){
					fetchValue(element);
				}).append(imgReload);
				var renameButtonInternal = $('<button/>').addClass('btn_in_keyName').attr('title','Rename Key').bind("click",function(){
					renameKey(element);
				}).append(imgRename);
				var newButton = $('<button/>', {
					text: element,
					id: 'btn_'+element
				}).addClass('btn_key').bind("click", function() { 
					fetchValue(element);
				}).text(function(index,currentText){
								if(currentText.length > 30)
									return currentText.substr(0,30) + '...';
								else
									return currentText.substr(0,30);
						});;
				var ButtonDiv = $('<div/>', {
					id: 'div_'+element
				}).addClass('btnDivClass').append(newButton).append(deleteButton).append(reloadButtonInternal).append(renameButtonInternal);
				$("#allKeyDivId").append(ButtonDiv);
			});
			$("#notConnectedDiv").hide();
			$("#connectedDiv").show();
			$("#descTextBox").html('Connected to redis on server '+redisHostPort.host+" and on port "+redisHostPort.port+" and selected database is "+redisHostPort.db);
		}else{
			showDialogBox("Connection Error","Unable to connect : Host,Port or Auth is wrong",false);		
		}
			}else{
	showDialogBox("Connection Error","Unable to connect : Host,Port or Auth is wrong",false);
}
},
error: function (xhr, status, error) {
					console.log('Error: ' + error);
		showDialogBox("Connection Error","Unable to connect : Host,Port or Auth is wrong",false);
			},
	});
}
}

/**Method to fetch value of given key from rwm API**/
function fetchValue(key){
		$.ajax({
			url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/get/'+key,
				data: redisHostPort,
				type: 'POST',
				success: function (data) {
					if(data.err){
						showDialogBox("Error",'Some error occured while fetching key '+data.key+'\'s value.',false);
						fetchKeys();
					}else
						displayValue(data);
				},
			error: function (xhr, status, error) {
				showDialogBox("Error",'Some error occured while fetching key '+data.key+'\'s value.',false);
				fetchKeys();
			},
		});
}


/**Display value of given object which contains redis keytype,key and its value**/
function displayValue(data){
toggleKeyType(data.keyType);

/**To clear all the division before displaying any value**/
$("#valueTableDivId").html('');
$('#valueTextDivId').html('');
$('#singleValueDisplayDivId').html('');

/**Active key and it's type will be changed using this method which will be used in another methods**/
changeActiveKey(data.key,data.keyType);

var mainValue = data.value;
switch(data.keyType)
{
	case "string":
		/**Display single string type key's value in single textbox**/
		$("#keyValueDisplayDivId").hide();
		$("#singleValueDisplayDivId").show();
		$("#singleValueDisplayDivId")
			.data('keyType',data.keyType)
			.data('key',data.key)
			.data('value',data.value)
			.html(data.value);
			$("#internalEditButtonId").data('activeValueForStringType',data.value);
		break;
	case "hash":
		/**Create table of values of given key in upper textbox and lower textbox will be used for values of selected row**/
		$("#keyValueDisplayDivId").show();
		$("#singleValueDisplayDivId").hide();
		var i =1;
		var table = $('<table>', {
					id: 'tbl_'+data.key
					}).addClass('internalTable');
		var editHeader = $('<th>').text('');
		var hc1 = $('<th>').text('row');
		var hc2 = $('<th>').text('key');
		var hc3 = $('<th>').text('value');
		var headerRow = $('<tr>').addClass('headerRow').append(editHeader).append(hc1).append(hc2).append(hc3);
		table.append(headerRow);
		var allKeysInHash = Object.keys(mainValue);
		allKeysInHash.forEach(function(element){
		var value = mainValue[element];
		var imgEdit = $('<img>').addClass('small_icon').attr('src', '/img/edit_button.png');
		var editButtonInternalTable = $('<button/>').addClass('btn_in_table').attr('title','Edit Row').append(imgEdit).bind("click",function(){
				editRow($(this).parent().parent());
			});
			var columnEdit = $('<td>').append(editButtonInternalTable).addClass('editColInteralTable');
			var column1 = $('<td>').text(i).addClass('firstColInteralTable');
			var column2 = $('<td>').text(element).addClass('secondColInternalTable').addClass('keyColumn');
			var column3 = $('<td>').text(mainValue[element])
								   .addClass('thirdColHash')
								   .text(function(index,currentText){
																if(currentText.length > 100)
																	return currentText.substr(0,100) + '...';
																else
																	return currentText.substr(0,100);
									});
		var hashValueRow = $('<tr>').data('keyType',data.keyType)
			.data('key',element)
			.data('value',mainValue[element])
			.append(columnEdit)
			.append(column1).append(column2).append(column3)
			.bind("click", function(){
				hashSetListBindRow(this);
				toggleDeleteSelectedButtonDisable();
			});
		table.append(hashValueRow);
		i++;
		});
		$('#valueTableDivId').append(table);
		break;
		case 'list':
		case 'set':
			$("#keyValueDisplayDivId").show();
			$("#singleValueDisplayDivId").hide();
			var i =1;
			var table = $('<table>', {
							id: 'tbl_'+data.key
						}).addClass('internalTable');
			var editHeader = $('<th>').text('');
			var sc1 = $('<th>').text('row');
			var sc2 = $('<th>').text('value');
			var headerRow = $('<tr>').addClass('headerRow').append(editHeader).append(sc1).append(sc2);
			table.append(headerRow);
			mainValue.forEach(function(element){
				var imgEdit = $('<img>').addClass('small_icon').attr('src', '/img/edit_button.png');
				var editButtonInternalTable = $('<button/>').addClass('btn_in_table').attr('title','Edit Row').append(imgEdit).bind("click",function(){
					editRow($(this).parent().parent());
				});
				var columnEdit = $('<td>').append(editButtonInternalTable).addClass('editColInteralTable');
				var column1 = $('<td>').text(i).addClass('firstColInteralTable');
				var column2 = $('<td>').text(element).addClass('thirdColHash').addClass('keyColumn').text(function(index,currentText){
																	if(currentText.length > 100)
																		return currentText.substr(0,100) + '...';
																	else
																		return currentText.substr(0,100);
								});
			var listSetValueRow = $('<tr>').data('keyType',data.keyType)
				.data('value',element)
				.append(columnEdit).append(column1).append(column2)
				.bind("click", function(){
					hashSetListBindRow(this);
					toggleDeleteSelectedButtonDisable();
				});
			table.append(listSetValueRow);
			i++;
			});			
			$('#valueTableDivId').append(table);
		break;			
		case 'zset':
			/**Create table of values of given key in upper textbox and lower textbox will be used for values of selected row**/
			$("#keyValueDisplayDivId").show();
			$("#singleValueDisplayDivId").hide();
			var table = $('<table>', {
							id: 'tbl_'+data.key
						}).addClass('internalTable');
			var editHeader = $('<th>').text('');
			var hc1 = $('<th>').text('row');
			var hc2 = $('<th>').text('value');
			var hc3 = $('<th>').text('score');
			var headerRow = $('<tr>').addClass('headerRow').append(editHeader).append(hc1).append(hc2).append(hc3);
			table.append(headerRow);
			var j = 1;
			for (var i = 0; i < mainValue.length; i = i+2) {
				var key = mainValue[i]
				var score = mainValue[i+1]
				var imgEdit = $('<img>').addClass('small_icon').attr('src', '/img/edit_button.png');
				var editButtonInternalTable = $('<button/>').addClass('btn_in_table').attr('title','Edit Row').append(imgEdit).bind("click",function(){
					editRow($(this).parent().parent());
				});
				var columnEdit = $('<td>').append(editButtonInternalTable).addClass('editColInteralTable');
					var column1 = $('<td>').text(j).addClass('firstColInteralTable');
				var column2 = $('<td>').text(key).addClass('secondColInternalTable').addClass('keyColumn');
				var column3 = $('<td>').text(score).addClass('thirdColHash').text(function(index,currentText){
																	if(currentText.length > 100)
																		return currentText.substr(0,100) + '...';
																	else
																		return currentText.substr(0,100);
								});
				var hashValueRow = $('<tr>').data('keyType',data.keyType)
					.data('value',key).data('score',score)
					.append(columnEdit).append(column1).append(column2).append(column3)
					.bind("click", function() { 
						$(this).toggleClass('selectedRow');
						toggleDeleteSelectedButtonDisable();
						$("#valueTextDivId").html($(this).data('score'));
					});
			table.append(hashValueRow);
			j++;
			}
			$('#valueTableDivId').append(table);
		break;
		default:
			$("#valueTableDivId").html(mainValue);
			break;
}
}

/**This method will be called when any row of internal table will be clicked**/
/**Displaye value of clicked row into lower div**/
function hashSetListBindRow(row) { 
	$(row).toggleClass('selectedRow');
	var valueToDisplay = $(row).data('value');
	try{
		var jsonPretty = JSON.parse(valueToDisplay);
		$("#valueTextDivId").html(valueToDisplay);
	}catch(e){
		
	}finally{
	if($("#valueTextDivId").html() == "" || $("#valueTextDivId").html() == null)
		$("#valueTextDivId").html(valueToDisplay);
	}
}

/**Toggle delete selected button based on if any row is selected or not**/
function toggleDeleteSelectedButtonDisable(){
	if($(".selectedRow").length > 0)
		$("#internalDeleteSelectedButtonId").prop('disabled', false);
	else
		$("#internalDeleteSelectedButtonId").prop('disabled', true);
}

/**This method will be called when displayValue method called**/
function toggleKeyType(keyType){
	$(".internalButtonsClass").show();
	if(keyType == "string"){
		$(".notStringTypeKeyButtonClass").hide();
	}else if(keyType == "hash" || keyType == "zset" || keyType == "list" || keyType == "set"){
		$(".stringTypeKeyButtonClass").hide();
	}
}

/**To reload active key**/
function reloadInternalKey(){
	fetchValue(activeKey);
}

/**To display dialog box based on given parameters in this method**/
function showDialogBox(header,text,isConfirmDialog){
	$("#errorDialogHeader").html(header);
	$("#errorDialogText").html(text);
	if(isConfirmDialog){
		$("#btnErrorDialogOK").html('Yes');
		$("#btnErrorDialogClose").html('No');
		$("#btnErrorDialogOK").show();
	}else{
		$("#btnErrorDialogOK").hide();
		$("#btnErrorDialogClose").html('Close');
	}
	jQuery("#errorModal").modal({backdrop: true});
}

/**To close a model based on given id**/
function closeGivenIdModel(modelId){
	$('#'+modelId).find("input,textarea").val('').end();
	$('#'+modelId).find("select").prop("selectedIndex", 0).end();
	$('#'+modelId).modal('hide');
}

/**********************Methods to delete keys and delete multiple keys***************************************/

function deleteKey(key){
	$.ajax({
				url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/delete/'+key,
				data: redisHostPort,
				type: 'DELETE',
				success: function (data) {
					if(data.err){
						showDialogBox("Error","Some error occured while deleting key "+data.key,false);
						fetchValue(data.key);
					}else
						fetchKeys();
				},
			error: function (xhr, status, error) {
				console.log('Error: ' + error);
				showDialogBox("Error","Some error occured while deleting key "+data.key,false);
				fetchValue(data.key);
			},
				});
}
function deleteSelected(rowElement){
	 var selectedIDs = [];
	 if(rowElement != null){
      selectedIDs.push($(rowElement).find(".keyColumn").html());
	}else{
		$(".selectedRow").each(function(index, row) {
      selectedIDs.push($(row).find(".keyColumn").html());
	 	});
	}
   redisHostPort.internalKeyArray = selectedIDs;
   $.ajax({
				url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/deleteMultiple/'+activeKey,
				data: redisHostPort,
				type: 'DELETE',
				success: function (data) {
					if(data.err || !data.isDeleted)
						showDialogBox("Error","Some error occured while deleting internal keys of key "+data.key,false);
					else if(data.noOfKeysDeleted != selectedIDs.length){
						showDialogBox("Error","Some error occured while deleting some internal keys of key "+data.key+" total "+noOfKeysDeleted+" deleted.",false);
						fetchValue(data.key);
					}else{
						fetchValue(data.key);
					}
				},
			error: function (xhr, status, error) {
				console.log('Error: ' + error);
				showDialogBox("Error","Some error occured while deleting Internal keys of key "+data.key,false);
				fetchValue(data.key);
			},
	});
}
function showIsDeleteDialog(key){
	if(key == null)
		key = activeKey;
	showDialogBox('Confirm','Are you sure?',true);
	$("#btnErrorDialogOK").off('click').click(function(){
		deleteKey(key);
	});
}
function showIsDeleteMultipleDialog(key){
	if($(".selectedRow").length > 0){
	showDialogBox('Confirm','Do you want to delete all selected keys?',true);
		$("#btnErrorDialogOK").off('click').click(function(){
			deleteSelected();
		});
	}
}

/**********************************************************************************************************/

/**************************************************Method to edit value of key****************************/

function showEditDialog(){
	$("#edit_stringType_singleValue").val($("#internalEditButtonId").data('activeValueForStringType'));
	jQuery("#editStringTypeModal").modal({backdrop: true});
}

$(document).ready(function(){
$("#btnEditStringTypeModal").click(function(){
	var editStringTypeSingleValue = $("#edit_stringType_singleValue").val();

	var errorEditStringTypeSingleValue = $("#error_edit_stringType_singleValue");

	var dataToSend = {};
	if(activeKey == "" || activeKeyType == null)
			showDialogBox("Error","Some error occured.Can't find key.Please reload key's tree and try again",false);
	else{
				dataToSend.key = activeKey;
				dataToSend.keyType = activeKeyType;
			switch(activeKeyType){
				case "string":
					if(editStringTypeSingleValue == "" || editStringTypeSingleValue == null)
						errorEditStringTypeSingleValue.html("Please enter value");
					else{
						errorEditStringTypeSingleValue.html("");
						dataToSend.singleValue = editStringTypeSingleValue;
						closeGivenIdModel("editStringTypeModal");
						addKeyAPICall(dataToSend);
					}
				break;
				case "set":
				case "list":
				case "hash":
				case "zset":
					showDialogBox("Error","Some error occured.Can't find key.Please reload key's tree and try again",false);
				break;
			}
			}
});
});

function editRow(rowElement){
	var dataForEditRow = new Object();
	dataForEditRow.keyType = $(rowElement).data('keyType');
	dataForEditRow.key = $(rowElement).data('key');
	dataForEditRow.value = $(rowElement).data('value');
	dataForEditRow.score = $(rowElement).data('score');
	showAddRowDialog(dataForEditRow,rowElement);
}

/**********************************************************************************************************/

/*************************************************To add key or row in a key*****************************/

function showAddKeyDialog(){
	jQuery("#addKeyModal").modal({backdrop: true});
}

function showAddRowDialog(data,rowElement){
	$("#error_add_Row_singleValue").html("");
	$("#error_add_Row_doubleValue_internalKey").html("");
	$("#error_add_Row_doubleValue_internalScore").html("");
	$("#error_add_Row_doubleValue_internalValue").html("");

	$("#btnAddRowModal").html("Add");

	var keyTypeForSwitchCase = activeKeyType;
	if(data != null && rowElement != null){
		keyTypeForSwitchCase = data.keyType;
		$("#btnAddRowModal").html("Update");
		$("#btnAddRowModal").data('rowElement',rowElement);
	}else{
		$("#btnAddRowModal").html("Add");
	}
	switch(keyTypeForSwitchCase){
		case "zset":
		if(data != null){
				$("#add_Row_doubleValue_internalScore").val(data.score);
				$("#add_Row_doubleValue_internalValue").val(data.value);
			}
			else{
				$("#add_Row_doubleValue_internalScore").val('');
				$("#add_Row_doubleValue_internalValue").val('');
			}
			$("#addRowDoubleValue").show();
			$("#addRowSingleValue").hide();
			$("#internalKeyDivForRow").hide();
			$("#internalScoreDivForRow").show();
			jQuery("#addRowModal").modal({backdrop: true});
			break;
		case "hash":
			if(data != null){
				$("#add_Row_doubleValue_internalKey").val(data.key);
				$("#add_Row_doubleValue_internalValue").val(data.value);
			}else{
				$("#add_Row_doubleValue_internalKey").val('');
				$("#add_Row_doubleValue_internalValue").val('');
			}
			$("#addRowDoubleValue").show();
			$("#addRowSingleValue").hide();
			$("#internalScoreDivForRow").hide();
			$("#internalKeyDivForRow").show();
			jQuery("#addRowModal").modal({backdrop: true});
			break;
		case "list":
		case "set":
		if(data != null){
			$("#add_Row_singleValue").val(data.value);
		}else{
			$("#add_Row_singleValue").val('');
		}
			$("#addRowDoubleValue").hide();
			$("#addRowSingleValue").show();
			jQuery("#addRowModal").modal({backdrop: true});
			break;
		case "string":
		default:
			showDialogBox('Error','Some error occured.Key type is undefined.Please reload key\'s tree and try again',false);
	}
}

$(document).ready(function(){
	$("#add_key_keyTypeDropdown").change(function(){
	var selectedValue = $(this).val();
	switch(selectedValue){
		case "zset":
			$("#addKeyDoubleValue").show();
			$("#addKeySingleValue").hide();
			$("#internalKeyDiv").hide();
			$("#internalScoreDiv").show();
			break;
		case "hash":
			$("#addKeyDoubleValue").show();
			$("#addKeySingleValue").hide();
			$("#internalScoreDiv").hide();
			$("#internalKeyDiv").show();
			break;
		case "string":
		case "list":
		case "set":
		default:
			$("#addKeyDoubleValue").hide();
			$("#addKeySingleValue").show();
			break;
	}
});

	$("#add_key_txtboxkey").keyup(function(){
	if($(this).val() != "" && $(this).val() != null)
		isKeyExists($(this).val(),"addKey");
});

	/**Add key dialog box validation**/
	$("#btnAddKeyModal").click(function(){
	var key = $("#add_key_txtboxkey").val();
	var keyType = $("#add_key_keyTypeDropdown").val();
	var singleValue = $("#add_key_singleValue").val();
	var doubleValueInternalKey = $("#add_key_doubleValue_internalKey").val();
	var doubleValueInternalScore = $("#add_key_doubleValue_internalScore").val();
	var doubleValueInternalValue = $("#add_key_doubleValue_internalValue").val();

	var errorTextboxkey = $("#add_key_txtboxkey_error");
	var errorTextboxSingleValue = $("#error_add_key_singleValue");
	var errorTextboxInternalKey = $("#error_add_key_doubleValue_internalKey");
	var errorTextboxInternalScore = $("#error_add_key_doubleValue_internalScore");
	var errorTextboxInternalValue = $("#error_add_key_doubleValue_internalValue");

	var dataToSend = {};
	dataToSend.key = key;
	dataToSend.keyType = keyType;
		if(key == "" || key == null)
			errorTextboxkey.html("Please enter key");
		else{
			errorTextboxkey.html("");
			switch(keyType){
				case "string":
				case "set":
				case "list":
					if(singleValue == "" || singleValue == null)
						errorTextboxSingleValue.html("Please enter value");
					else{
						errorTextboxSingleValue.html("");
						dataToSend.singleValue = singleValue;
						addKeyAPICall(dataToSend);
					}
				break;
				case "hash":
					errorTextboxInternalKey.html("");
					errorTextboxInternalValue.html("");
					if(doubleValueInternalKey == "" || doubleValueInternalKey == null)
						errorTextboxInternalKey.html("Please enter internal key");
					else if(doubleValueInternalValue == "" ||doubleValueInternalValue ==  null)
						errorTextboxInternalValue.html("Please enter value");
					else{
						dataToSend.internalKey = doubleValueInternalKey;
						dataToSend.internalValue = doubleValueInternalValue;
						addKeyAPICall(dataToSend);
					}
				break;
				case "zset":
					errorTextboxInternalScore.html("");
					errorTextboxInternalValue.html("");
					if(doubleValueInternalScore == "" || doubleValueInternalScore == null)
					errorTextboxInternalScore.html("Please enter score");
					else if(doubleValueInternalValue == "" ||doubleValueInternalValue ==  null)
						errorTextboxInternalValue.html("Please enter value");
					else{
						dataToSend.internalScore = doubleValueInternalScore;
						dataToSend.internalValue = doubleValueInternalValue;
						addKeyAPICall(dataToSend);
					}
				break;
			}
		}
});

/**Add Row dialog box validation**/
$("#btnAddRowModal").click(function(){

	var rowElement = $(this).data('rowElement');

	if(rowElement != null)
		deleteSelected(rowElement);
	var singleValue = $("#add_Row_singleValue").val();
	var doubleValueInternalKey = $("#add_Row_doubleValue_internalKey").val();
	var doubleValueInternalScore = $("#add_Row_doubleValue_internalScore").val();
	var doubleValueInternalValue = $("#add_Row_doubleValue_internalValue").val();

	var errorTextboxSingleValue = $("#error_add_Row_singleValue");
	var errorTextboxInternalKey = $("#error_add_Row_doubleValue_internalKey");
	var errorTextboxInternalScore = $("#error_add_Row_doubleValue_internalScore");
	var errorTextboxInternalValue = $("#error_add_Row_doubleValue_internalValue");

	var dataToSend = {};
	dataToSend.key = activeKey;
	dataToSend.keyType = activeKeyType;
		if(activeKey == "" || activeKeyType == null)
			showDialogBox("Error","Some error occured.Can't find key.Please reload key's tree and try again",false);
		else{
			switch(activeKeyType){
				case "string":
					showDialogBox("Error","Some error occured.Key type is string and row can't be added for string type key.Please reload key's tree and try again",false);
				case "set":
				case "list":
					if(singleValue == "" || singleValue == null)
						errorTextboxSingleValue.html("Please enter value");
					else{
						errorTextboxSingleValue.html("");
						dataToSend.singleValue = singleValue;
						addRowAPICall(dataToSend);
					}
				break;
				case "hash":
					errorTextboxInternalKey.html("");
					errorTextboxInternalValue.html("");
					if(doubleValueInternalKey == "" || doubleValueInternalKey == null)
						errorTextboxInternalKey.html("Please enter internal key");
					else if(doubleValueInternalValue == "" ||doubleValueInternalValue ==  null)
						errorTextboxInternalValue.html("Please enter value");
					else{
						dataToSend.internalKey = doubleValueInternalKey;
						dataToSend.internalValue = doubleValueInternalValue;
						addRowAPICall(dataToSend);
					}
				break;
				case "zset":
					errorTextboxInternalScore.html("");
					errorTextboxInternalValue.html("");
					if(doubleValueInternalScore == "" || doubleValueInternalScore == null)
					errorTextboxInternalScore.html("Please enter score");
					else if(doubleValueInternalValue == "" ||doubleValueInternalValue ==  null)
						errorTextboxInternalValue.html("Please enter value");
					else{
						dataToSend.internalScore = doubleValueInternalScore;
						dataToSend.internalValue = doubleValueInternalValue;
						addRowAPICall(dataToSend);
					}
				break;
			}
		}
});

$("#btnCloseAddKeyModal").click(function(){
	closeGivenIdModel('addKeyModal');
});

});

/**API call to add key in a database**/
function addKeyAPICall(dataToSend){
	closeGivenIdModel('addKeyModal');
	$("#addKeyDoubleValue").hide();
	$("#addKeySingleValue").show();
	redisHostPort.keyType =dataToSend.keyType;
	redisHostPort.key =dataToSend.key;
	redisHostPort.singleValue =dataToSend.singleValue;
	redisHostPort.internalKey =dataToSend.internalKey;
	redisHostPort.internalScore =dataToSend.internalScore;
	redisHostPort.internalValue =dataToSend.internalValue;
	$.ajax({
			url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/addKey',
				data: redisHostPort,
				type: 'POST',
				success: function (data) {
					if(data.err){
						showDialogBox("Error",'Some error occured while adding key '+data.key,false);
						fetchKeys();
					}else{
						fetchKeys();
						fetchValue(data.key);
						showDialogBox("Success",'Key added or updated successfully',false);
					}
				},
			error: function (xhr, status, error) {
				showDialogBox("Error",'Some error occured while fetching key '+data.key,false);
				fetchKeys();
			},
		});
}

/***API call to add row in a key**/
function addRowAPICall(dataToSend){
	closeGivenIdModel('addRowModal');
	redisHostPort.keyType =dataToSend.keyType;
	redisHostPort.key =dataToSend.key;
	redisHostPort.singleValue =dataToSend.singleValue;
	redisHostPort.internalKey =dataToSend.internalKey;
	redisHostPort.internalScore =dataToSend.internalScore;
	redisHostPort.internalValue =dataToSend.internalValue;
	$.ajax({
			url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/addRow',
				data: redisHostPort,
				type: 'POST',
				success: function (data) {
					if(data.err){
						showDialogBox("Error",'Some error occured while adding row for key '+data.key,false);
						fetchValue(data.key);
					}else{
						fetchValue(data.key);
						showDialogBox("Success",'Row added or updated successfully',false);
					}
				},
			error: function (xhr, status, error) {
				showDialogBox("Error",'Some error occured while adding for key '+data.key,false);
				fetchValue(data.key);
			},
		});
}

/*****************************************************************************************************************/

/********************************************methods to rename keys*************************************************/

function renameKey(element){
	fetchValue(element);
	$("#rename_Key_newKey").val(element);
	showRenameKeyDialog();
}

function showRenameKeyDialog(){
	$("#error_rename_Key_newKey").html("");
	jQuery("#renameKeyModal").modal({backdrop: true});
}

$(document).ready(function(){
	$("#rename_Key_newKey").keyup(function(){
	if($(this).val() != "" && $(this).val() != null)
		isKeyExists($(this).val(),"renameKey");
});

/**Rename Key dialog box validation**/
$("#btnRenameKeyModal").click(function(){
	var newKeyValue = $("#rename_Key_newKey").val();

	var errorTextboxnewKey = $("#error_rename_Key_newKey");

	if(newKeyValue == "" || newKeyValue == null)
		errorTextboxnewKey.html("Empty Key not allowed");

	if(errorTextboxnewKey.html() == null || errorTextboxnewKey.html() == ""){
		var dataToSend = {};
	dataToSend.key = activeKey;
	dataToSend.keyType = activeKeyType;
		if(activeKey == "" || activeKeyType == null)
			showDialogBox("Error","Some error occured.Can't find key.Please reload key's tree and try again",false);
		else{
			dataToSend.newKey = newKeyValue;
			renameKeyAPICall(dataToSend);
		}
	}
});
});
/**API call to rename a key**/
function renameKeyAPICall(dataToSend){
	closeGivenIdModel('renameKeyModal');
	redisHostPort.keyType =dataToSend.keyType;
	redisHostPort.key =dataToSend.key;
	redisHostPort.newKey =dataToSend.newKey;
	$.ajax({
			url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/renameKey',
				data: redisHostPort,
				type: 'POST',
				success: function (data) {
					if(data.err){
						showDialogBox("Error",'Some error occured',false);
						fetchKeys();
						fetchValue(data.key);
					}else{
						fetchKeys();
						fetchValue(data.newKey);
						showDialogBox("Success",data.key+' has been renamed successfully',false);
					}
				},
			error: function (xhr, status, error) {
				showDialogBox("Error",'Some error occured',false);
				fetchKeys();
			},
		});
}

/******************************************************************************************************************/

/*********************************************Check if key alreayd exists or not***********************************/

function showKeyExistsError(isKeyExistsResponse,calledFromDialog){
	switch(calledFromDialog){
		case "addKey":
			if(isKeyExistsResponse.isExists)
				$("#add_key_txtboxkey_error").html("'"+isKeyExistsResponse.key+"' already exists and it's keyType is '"+isKeyExistsResponse.keyType+"'.<br/>1. If newKey type will be string then key's value will be updated.<br/>2. If newKey type will be same as originalKey type then new row will be added in originalKey.<br/>3. If newKey type will be different then originalKey type then error will be thrown.");
			else
				$("#add_key_txtboxkey_error").html("");
			break;
		case "renameKey":
			if(isKeyExistsResponse.isExists)
				$("#error_rename_Key_newKey").html("'"+isKeyExistsResponse.key+"' already exists");
			else
				$("#error_rename_Key_newKey").html("");
			break;
	}
}

/**API call to check if key exists or not**/
function isKeyExists(key,calledFromDialog){
	var isKeyExistsObj = new Object();
	$.ajax({
				url: 'http://'+nodeJsHost+':'+nodeJsPort+'/rwm/exists/'+key,
				data: redisHostPort,
				type: 'POST',
				success: function (data) {
					if(data.isExists){
						isKeyExistsObj.isExists = true;
						isKeyExistsObj.key = data.originalKey;
						isKeyExistsObj.keyType = data.originalKeyType;
					}
					else{
						isKeyExistsObj.isExists = false;
					}
					showKeyExistsError(isKeyExistsObj,calledFromDialog);
				},
			error: function (xhr, status, error) {
				isKeyExistsObj.isExists = false;
						showKeyExistsError(isKeyExistsObj,calledFromDialog);
			},
				});
}

/*****************************************************************************************************/