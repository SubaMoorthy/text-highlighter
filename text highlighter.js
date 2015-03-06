
var color_classes = ['highlight_1', 'highlight_2', 'highlight_3', 'highlight_4', 'highlight_5', 'highlight_6', 'highlight_7', 'highlight_8', 'highlight_9', 'highlight_10', 'highlight_11', 'highlight_12'];

var categories = [];

$( document ).ready(function() {
	categories = $('body').attr('categories').split(',');
	
	$(".sentence").text().replace('\t','')
	$(".sentence").each(function() {
		var curr_sent = $(this);
		var words = curr_sent.text().split(' ');
		curr_sent.empty();
		var spl_chars;
		var offset = 0
		$.each(words, function(i, word) {
		if(!/^[a-zA-Z0-9]*$/.test(word)) {
			var spl_chars = word.substring(word.match(/([^A-Za-z])/i).index, word.length);
			word = word.substring(0, word.match(/([^A-Za-z])/i).index)
			curr_sent.append($("<span offset=" + offset +">").text(word));
			offset += word.length;
			curr_sent.append($("<span offset=" + offset +">").text(spl_chars));
			offset += spl_chars.length;
			curr_sent.append($("<span offset=" + offset +">").text(" "));
			offset += 1;
		}
		else {
			curr_sent.append($("<span offset=" + offset +">").text(word));
			offset += word.length;
			curr_sent.append($("<span offset=" + offset +">").text(" "));
			offset += 1;
		}
		});
	});
	
});

/* bind events */
$(function(){
	$(".sentence").bind("mouseup",highlightSelection);
	$('button[name=submit]').bind("click", submit);
})

function highlightSelection(){
	var parent_id = $(this).parent().attr('id');
	var text = '';
	if (window.getSelection) { // supported by webkit and 
		sel = window.getSelection();
		rangeObject = sel.getRangeAt(0);
		//when start and end container are same; there is only one span in the selection
		if (rangeObject.startContainer == rangeObject.endContainer) {
			//alert(rangeObject.startContainer.parentNode.id);
			console.log("contains only one element");
			rangeObject.startContainer.parentNode.classList.add('currentSelection')
		}
		// find all spans contained in the selection
		else {
			var begin = $(rangeObject.startContainer.parentNode);
			var end = $(rangeObject.endContainer.parentNode);
			//starting from begin, traverse through all the siblings till reaching end
			$(begin).addClass('currentSelection');
			 $(begin).nextAll().each(function(){
				var sibling = $(this);
				if (sibling.get(0) != $(end).get(0)) {
					$(this).addClass('currentSelection');
				}
				else { 
					$(this).addClass('currentSelection');
					return false;
				}
			 });
		}
	}

	var class_to_add = '';
	var highlight_classes = [];
	$(this).find('span').each( function() {
		if ($(this).hasClass('currentSelection') && $(this).is('[class^="highlight"]')) {
			if (class_to_add == '') {
				class_to_add = $(this)[0].classList[0];
			}
			else {
				var tag_span = $("#" +parent_id).find('div[id='+$(this)[0].classList[0]+']').find('span');
				$(tag_span).text($(tag_span).text().replace($(this).text(),''));
				if (!/\S/.test($(tag_span).text())) {
					$(tag_span).parent().parent().remove();
				}
			}
		}
		if ( $(this)[0].classList.length > 0 && $.inArray($(this)[0].classList[0], highlight_classes) == -1 ) {
				highlight_classes.push($(this)[0].classList[0])
			}
	});	
	highlight_classes.splice($.inArray('currentSelection', highlight_classes),1);
	
	if (class_to_add == '') {
		// choose the highlight class for current selection
		$.grep(color_classes, function(el) {
			if ($.inArray(el,highlight_classes) == -1) {
			class_to_add = el;
			return false;
		}
	});
	}

	$(this).find('span').each( function() {
		if ($(this).hasClass('currentSelection')) {
			$(this).removeClass();
			$(this).addClass(class_to_add);
		}
	});
	$(this).find('span[class='+class_to_add+']').each( function() {
		text += $(this).text();
	});
	window.getSelection().removeAllRanges();	
	if ( $( $('#'+ parent_id).parent().find('[type=checkbox]') ).is(':checked') ) {
		$( $('#'+ parent_id).parent().find('[type=checkbox]') ).attr('checked', false);
		createTagRow(parent_id, class_to_add, text);
	}
	else {
		createTagRow(parent_id, class_to_add, text);
	}
}

function createTagRow(fieldset_id, class_identifier, text) {
	var fieldset = document.getElementById(fieldset_id);
	var name = class_identifier;
	name = name.replace(/ /g,'');
	
	//check if the tag is a modification of some previous selection or a new selection
	if (!$('#'+ fieldset_id+ '>div[id='+ name+']').length) {
		var div = document.createElement("div");
		var span_container = document.createElement("div");
		var form = document.createElement("form");
		var radio_container = document.createElement("div");
		var span = document.createElement("span");
		
		$(div).attr( 'id', name);
		$(div).attr( 'class', 'tag_div');
		$(div).attr( 'class', 'row');
		
		$(span_container).attr( 'class', 'col-xs-8');
		$(radio_container).attr( 'class', 'col-xs-8');
		$(radio_container).attr( 'name', 'radio_container');
		
		$(span).addClass(class_identifier);
		span.innerHTML = text;
		
		span_container.appendChild(span);
		div.appendChild(span_container);
		div.appendChild(radio_container);
		fieldset.appendChild(div);
		
		console.log()
		$.each(categories, function( key, value ) {
			console.log( key + ": " + value );
			var label = document.createElement("label");
			$(label).attr( 'class', 'radio-inline');
			radio_container.appendChild(label);
			$('<input />',{
				type : "radio",
				name : fieldset_id + name,
				value : fieldset_id +":\t" + text +":\t" +value,
			}).appendTo(label).after(value);
			
		});
		
		
		$('<button/>',{
		class: 'deleteBtn glyphicon glyphicon-remove',
        name: 'deleteTag'
		}).appendTo(radio_container);
	}
	else {
		$('#'+ fieldset_id+ '>div[id='+ name+']').find('span[class='+class_identifier+']').text(text);
	}
}
/* click listener for delete button*/
$( document ).on( "click", "button[name=deleteTag]", function() {
	console.log('clicked');
	var curr_id = $(this).parent().parent().attr('id');
	//remove selected tag's highlight in the main sentence
	$(this).parent().parent().parent().find('span[class='+ curr_id+']').removeClass();
	//remove tag component
	$(this).parent().parent().remove();
});


/* click listener for submit button */
function submit() {
		
		
		var submit_text = "";
		
		$('div[name=parent_container]').each(function() {
			submit_text += $(this).find('div[class=sentence]').attr('id') + "\t";
			if ( $( $(this).find('[type=checkbox]') ).is(':checked') ) {
				console.log('checked');
				if ($(this).find('div[class=row]').length > 0) {
					submit_text = '';
					$("#modal_box").modal({"show": true });
				}
				else {
					submit_text += "No entity"+ "\t"
				}
			}
			else {
				if ($(this).find('div[class=row]').length > 0) {
					$(this).find('div[class=row]').each(function() {
						if ($(this).find('[type=radio]:checked').length > 0) {
							submit_text += $(this).find('span').text() + "\t" + $(this).find('[type=radio]:checked').val() + "\t";
						}
						else {
							 $("#modal_box").modal({"show": true });
							submit_text = '';
							}
					});
				}
				else {
					submit_text = '';
					console.log('no check box, no radio');
					$("#modal_box").modal({"show": true });
				}
			}
		});
		
		console.log(submit_text);
		 e.preventDefault();
    // submit to our server
    $.ajax({
        url: "/submit",
        type: 'post',
        data: submit_text,
        success: function(result) {
            // submit to mechanical turk
            $('form').submit();
        }
		});
}

