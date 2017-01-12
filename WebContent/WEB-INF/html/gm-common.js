(function($) {
	
	$.gm = {
		dateBtnData : null,
		//Ajax Json 공통 사용코드
		ajax : function(url, data, successCallback, errorCallback, async) {
			$.ajax({
				type: 'POST', 
				url: ctx + url,
				dataType : 'json',
				cache: false,
				async: $.type(async) === 'undefined' || $.type(async) === 'null' ? false : async,
				processData: false,
				contentType : "application/json; charset=UTF-8",
				enctype: 'multipart/form-data',
				data : $.gm.getAjaxData(data),
				beforeSend: function(xhr) { xhr.setRequestHeader("AJAX", true); },
				success: ($.type(successCallback) === 'undefined' || $.type(successCallback) == 'null') ? function(data,status){} : successCallback,
				error: ($.type(errorCallback) === 'undefined' || $.type(errorCallback) == 'null') ? function(data, status, error){} : errorCallback
			});	
		},
		//Ajax Json 파일 데이터 공통사용
		getAjaxData : function(o) {
			var d = {};
			if ($.type(o) == 'object') {
				d.data = o;
			}
			else if ($.type(o) == 'array') {
				d.dataList = o;
			} else {
				throw Error('lllegal argument !!!!');
			}
			d.status = 0;
			d.msg = '';
			
			return JSON.stringify(d);
		},
		
		getJQueryObject : function(n) {
	    	var o = null;
	    	
	        if ($.type(n) === 'object') {
	        	o = $(n);
	        }
	        else if ($.type(n) === 'string') {
	        	o = $('#' + n);
	        	if (o.length == 0) {
	        		o = $('[name=' + n + ']');
	        		if (o.lenght > 0) {
	        			o = $(o.get(0)); 
	        		}
	        	}
	        } else {
	        	throw Error('lllegal argument !');
	        }
			
	        return o;
		},
		
		isDate : function(v) {
			var currVal = v; 
			if(currVal == '') {
				return false; 
			}
			var rxDatePattern = /^(\d{4})(\/|-){0,1}(\d{2})(\/|-){0,1}(\d{2})$/;  
			var dtArray = currVal.match(rxDatePattern); 
			if (dtArray == null) {
				return false; 
			}
			dtYear = dtArray[1]; 
			dtMonth = dtArray[3]; 
			dtDay= dtArray[5]; 
			if (dtMonth < 1 || dtMonth > 12) {
				return false; 
			}
			else if (dtDay < 1 || dtDay> 31) {
				return false; 
			}	
			else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) { 
				return false; 
			}
			else if (dtMonth == 2) { 
				var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0)); 
				if (dtDay> 29 || (dtDay == 29 && !isleap)) {
					return false; 
				}
			} 
			return true; 
		},
		
		isFunction : function(v) {
			if ($.type(v) === 'string') {
				try {
					if ($.type(eval(v)) === 'function') {
						return true;
					} else {
						return false;
					}
				} catch(e) {
					return false
				}
			} else {
				if ($.type(v) === 'function') {
					return true;
				} else {
					return false;
				}
			}
		},
		getElIdOrNm : function(e) {
			var id = e.attr('id');
			if ($.type(id) === 'undefined') {
				id = e.attr('nm');
			}
			return id;
		},
		dropdown : function(selector, container) {
			selector = $.type(container) === 'undefined' ? $(selector) : $(selector, container);
			selector.each(function (idx, oselect) {
				var e = $(oselect), wt = e.width();
				if (e.get(0).tagName.toLowerCase() != 'select') return;
				e.before($('<div class="dropdown"></div>')).css({'display' : 'none'});
				var id = $.gm.getElIdOrNm(e);
				var dd = e.prev();
				dd.append('<button id="' + id + '-dropdown" class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"><span class="caret"></span></button>');
				dd.append('<ul class="dropdown-menu" role="menu" aria-labelledby="' + id + '-dropdown"></ul>')
				var oul = $('ul.dropdown-menu', dd);
				$('option', e).each(function() { var ooption = $(this); oul.append('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" data-gm-option-val="' + ooption.val() + '">' + ooption.html() + '</a></li>') });
				$('li a', oul).on('click', function() { var ancher = $(this); txt = ancher.text(); ancher.closest('ul').prev().html(txt + ' <span class="caret"></span>'); e.val(ancher.data('gm-option-val')); });
				dd.css({'width' : wt}).append(e).find('button').css({'width' : wt}).end().find('ul').css({'width' : (dd.find('ul').width() < dd.width() ? dd.width() : dd.find('ul').width())});
				e.on('change', function() { var oselect = $(this); oselect.closest('div.dropdown').find('.dropdown-toggle').html($('option:selected', oselect).text() + ' <span class="caret"></span>'); });
				e.get(0).setVal = function(v) { var oselect = $(this); oselect.val(v); oselect.trigger('change'); };
				var soption = $('option:selected', e);
				if (soption.length > 0) {
					e.get(0).setVal(soption.val());
				}
				oul.css({'min-width' : wt, 'width' : wt});
			});
		},
	};
})(jQuery);



/*
 *  HTML Form Validation
 */

function JForm() {
	
	this.children = [];
	
	this.add = function(child) {
		this.children[this.children.length] = child;
		return this;
	};
	this.clear = function() {
		this.children = [];
	};
	this.last = function() {
		return this.children[this.children.length - 1]
	};
	this.validate = function() {
	    for (var i = 0; i < this.children.length; i++) {
	        if (!this.children[i].validate()) {
	            return false;
	        }
	    }
	    return true;
	};
}

/**
 *	Mandatory Validation.
 */
function JText(name, object, nullCheck) {

	this.name = name;
    this.object = $.gm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;
    
    this.validate = function() {
    	var value = this.object == null ? '' : this.object.val();
    	if (this.nullCheck && $.trim(value).length == 0) {
    		alert(this.name + '을(를) 입력하십시오.');
    		return this.focus();
    	}
    	return true;
    };
    this.focus = function() {
    	if (this.object != null ) {
    		this.object.focus();
    	}
        return false;
    };
}


/**
 *	Select Html Tag Validation.
 */
function JSelect(name, object, nullCheck, defaultValue) {

    this.name = name;
    this.object = $.gm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;
    this.defaultValue = ($.type (defaultValue) === 'null' || $.type (defaultValue) === 'undefined') ? '' : defaultValue;

    this.validate =  function() {
    	var value = this.object == null ? '' : this.object.val();
    	if (this.nullCheck && ((this.defaultValue.length == 0 && $.trim(value).length == 0) || (this.defaultValue == $.trim(value)))) {
    		alert(this.name + '을(를) 선택하십시오.');
    		return this.focus();
    	}
    	return true;
    };
    this.focus = function() {
    	if (this.object != null ) {
    		this.object.focus();
    	}
        return false;
    };
}

/**
 *	Date Type Validation.
 */
function JDate(name, object, nullCheck) {

	this.name = name;
    this.object = $.gm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;
	
    this.validate =  function() {
    	var value = this.object == null ? '' : this.object.val();
    	if (this.nullCheck && !$.gm.isDate(value)) {
    		alert(this.name + '을(를) 입력하십시오.');
    		return this.focus();
    	}
    	return true;
    };
    this.focus = function() {
    	if (this.object != null ) {
    		this.object.focus();
    	}
        return false;
    };
}

/**
 *	Number Type Validation.
 */
function JNumeric(name, object, nullCheck) {

	this.name = name;
    this.object = $.gm.getJQueryObject(object);
    this.nullCheck = ($.type (nullCheck) === 'null' || $.type (nullCheck) === 'undefined') ? true : nullCheck;
	
    this.validate =  function() {
    	var value = this.object == null ? '' : this.object.val().replace(/,/ig,'');
    	if (this.nullCheck && !$.isNumeric(value)) {
    		alert(this.name + '을(를) 입력하십시오.');
    		return this.focus();
    	}
    	return true;
    };
    this.focus = function() {
    	if (this.object != null ) {
    		this.object.focus();
    	}
        return false;
    };
}

function JCustom(fn) {
	if (!$.gm.isFunction(fn)) {
		throw Error('lllegal argument !');
	}
	this.fn = $.type(fn) === 'string' ? eval(fn) : fn;  
	this.validate = fn;
}

/**
 *	List Validation.
 */
var ListValidate = {
	
		select : function(sel, typ) {
			sel = $.type(sel) === 'string' ? $(sel) : sel;
			if (sel.length == 0) {
				alert(($.type(typ) == 'null' || $.type(typ) === 'undefined') ? '선택된 내역이 없습니다.' : (typ + ' 위해 선택된 내역이 없습니다.'));
				return false;
			}
			return true;
		},
		
		onlyone : function(sel) {
			sel = $.type(sel) === 'string' ? $(sel) : sel;
			 if (sel.length > 1) {
				alert('한건만 선택해야 합니다. 확인하십시오.');
				return false;
			}			
			return true;
		},
		
		delConfirm : function() {
			if (!confirm('삭제 하시겠습니까?')) {
				return false;
			}
			return true;
		}
};
