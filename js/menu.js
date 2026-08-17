/*
 Menu configuration file for NEW CuMX template
 Last modified: 2022/07/05 11:39:38
 menu.js - typical name, you define the one used in setpagedata.js

 It is STRONGLY RECOMMENDED that if you customise this file, you create a new file with a different name, e.g. mymenu.js
 and change setpagedata.js to use that file. This will avoid your customisations being accidentally overwritten during upgrades

 Properties:
   .menu             - can be 'b' (both menus), 'w' (wide menu ONLY), 'n' (narrow menu ONLY)
   .new_window:true  - forces the link to open in new browser window
   .forum:true       - flags a forum link menu item, it will use the url provided in CuMX config, if that is blank the menu item will be hidden
   .webcam:true      - flags a webcam link menu item, it will use the url provided in CuMX config, if that is blank the menu item will be hidden
*/

menuSrc = [
	{title: "Agora",          menu: "b",    url: "index.htm"},
	{title: "Hoje",        menu: "b",    url: "today.htm"},
	{title: "Ontem",    menu: "b",    url: "yesterday.htm"},
	{title: "Hoje-Ontem",   menu: "b",    url: "todayyest.htm"},
	{title: "Gauges",       menu: "b",    url: "gauges.htm"},
	{title: "Recordes",      menu: "b",    submenu: true,       items: [
		{title: "Este Mês",        menu: "b",    url: "thismonth.htm"},
		{title: "Este Ano",         menu: "b",    url: "thisyear.htm"},
		{title: "Desde Sempre",          menu: "b",    url: "record.htm"},
		{title: "Mensal",           menu: "b",    url: "monthlyrecord.htm"}
	]},
	{title: "Charts",    menu: "b",    submenu: true,    items: [
		{title: "Tendências",            menu: "b",    url: "trends.htm"},
		{title: "Escolhe-um-Gráfico",    menu: "b",    url: "selectachart.htm"},
		{title: "Historico",          menu: "b",    url: "historic.htm"}
	]},
	{title: "Reletórios",   menu: "b",    url: "noaareport.htm"},
	{title: "Fórum",     menu: "b",    url: "#",    forum: true,    new_window: true},
	{title: "Webcam",    menu: "b",    url: "#",    webcam: true}
];
