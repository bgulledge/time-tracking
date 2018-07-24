jQuery.sap.declare("utils.Dates");

(function() {

	function _getWeekNumber(date) {
		//ISO8601 correct
        date.setHours(0, 0, 0);
        date.setDate(date.getDate() + 4 - date.getDay());
        return Math.ceil((((date - new Date(date.getFullYear(), 0, 1)) / 86400000) + 1)/7);
    }

    function _getWeekNumberNonIso(date) {
		//Change week match portal,current level of Java in portal not ISO8601 - 09192016
    	var year = date.getFullYear();
		var weeknum = year === 2016 ? _getWeekNumber(date) + 1 : _getWeekNumber(date);

//		if(weeknum > 52) {
//			nYear = new Date(date.getFullYear() + 1,0,1);
//			nday = nYear.getDay() - dowOffset;
//			nday = nday >= 0 ? nday : nday + 7;
			/*if the next year starts before the middle of
			  the week, it is week #1 of that year*/
//			weeknum = nday < 4 ? 1 : 53;
//		}

		return weeknum;
	}

	utils.Dates = {

		current :  function (date) {
			var weekYr = "";
			if(date) {
				var year = date.getFullYear().toString();
				var week = _getWeekNumber(date).toString();
				if (week.length <2) {
					week = "0" + week;
				}
				weekYr = week + year;
			}
			return weekYr;
		},

		next :  function (date) {
					var weekYr = "";
					if(date) {
						var year = date.getFullYear().toString();
						var week = _getWeekNumberNonIso(date).toString();
						if (week.length <2) {
							week = "0" + week;
						}
						weekYr = week + year;
					}
					return weekYr;
		}
	};
} )();