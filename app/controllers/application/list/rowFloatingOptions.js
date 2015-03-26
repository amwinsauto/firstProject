var args = arguments[0] || {};

var optionControllers = [];

init(args.options, args.caller);

function init(options, caller) {
	for (var i = 0; i < options.length && i < 3; i++) {
		var option = options[i];

		var onClick;
		if (option.onClick) {
			onClick = {
				type : 'optionclick',
				caller : $.optionsView,
				geolocation : option.geolocation,
				request : {
					action : 'onClick',
					type : 'listitem',
					listitem : {
						name : option.name,
						onClick : option.onClick
					}
				}
			};
		}

		var optionController;
		if (optionControllers && optionControllers[i]) {
			optionController = optionControllers[i];
			optionController.updateOption(option.image, option.count, option.title, option.toggle, option.selected, onClick);
		} else {
			optionController = Alloy.createController('application/list/rowFloatingOption', {
				image : option.image,
				count : option.count,
				title : option.title,
				toggle : option.toggle,
				selected : option.selected,
				onClick : onClick
			});
			optionControllers.push(optionController);
			var option = optionController.getView();
			$.optionsView.add(option);
			// if (i === 0) {
			// $.leftOptionView.add(option);
			// } else if (i === 1) {
			// $.middleOptionView.add(option);
			// } else {
			// $.rightOptionView.add(option);
			// }
		}
	}
}

exports.updateOptions = function(options, caller) {
	init(options, caller);
};
