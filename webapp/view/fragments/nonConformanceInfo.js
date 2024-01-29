sap.ui.define(['sap/uxap/BlockBase'],
	function (BlockBase) {
		"use strict";

		var nonConformanceInfo = BlockBase.extend("nonconformanceodata.view.fragments.nonConformanceInfo", {
			metadata: {
				views: {
					Collapsed: {
						viewName: "nonconformanceodata.view.fragments.nonConformanceInfo",
						type: "XML"
					},
					Expanded: {
						viewName: "nonconformanceodata.view.fragments.nonConformanceInfo",
						type: "XML"
					}
				}
			}
		});

		return nonConformanceInfo;

	});
