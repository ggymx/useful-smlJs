var Ajax = function() {
	function request(url, opt) {
		function fn() {
		}
		var async = opt.async !== false, method = opt.method || "GET", data = opt.data
				|| null, success = opt.success || fn, failure = opt.failure
				|| fn;
		method = method.toUpperCase();
		if (method == "GET" && data) {
			url += (url.indexOf("?") == -1 ? "?" : "&") + data;
			data = null;
		}
		var xhr = window.XMLHttpRequest ? new XMLHttpRequest()
				: new ActiveXObject("Microsoft.XMLHTTP");
		xhr.onreadystatechange = function() {
			_onStateChange(xhr, success, failure);
		};
		xhr.open(method, url, async);
		if (method == "POST") {
			xhr.setRequestHeader("Content-type",
					"application/x-www-form-urlencoded;");
		}
		xhr.send(data);
		return xhr;
	}
	function _onStateChange(xhr, success, failure) {
		if (xhr.readyState == 4) {
			var s = xhr.status;
			if (s >= 200 && s < 300) {
				success(xhr.responseText);
			} else {
				failure(xhr.responseText);
			}
		} else {
		}
	}
	return {
		request : request
	};
}();