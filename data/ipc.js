const {ipcRenderer, shell, clipboard} = require('electron')

const dialog = require('../modules/dialog')
const gametree = require('../modules/gametree')
const setting = require('../modules/setting')

let menudata = {
    newfile: () => sabaki.newFile({sound: true, showInfo: true}),
    newwindow: () => ipcRenderer.send('new-window'),
    loadfile: () => sabaki.loadFile(),
    savefile: () => sabaki.saveFile(sabaki.state.representedFilename),
    saveas: () => sabaki.saveFile(),
    loadclipboard: () => sabaki.loadContent(clipboard.readText(), 'sgf', {ignoreEncoding: true}),
    copytoclipboard: () => clipboard.writeText(sabaki.getSGF()),
    copyascii: () => clipboard.writeText(gametree.getBoard(...sabaki.state.treePosition).generateAscii()),
    gameinfo: () => sabaki.openDrawer('info'),
    managegames: () => sabaki.openDrawer('gamechooser'),
    preferences: () => sabaki.openDrawer('preferences'),

    selectposition: () => dialog.showInputBox('Enter a coordinate to select a point', sabaki.clickVertex),
    pass: () => sabaki.makeMove([-1, -1]),
    resign: () => sabaki.makeResign(),
    toggleplayer: () => sabaki.setPlayer(...sabaki.state.treePosition, -sabaki.getPlayer(...sabaki.state.treePosition)),
    score: () => sabaki.setMode('scoring'),
    estimate: () => sabaki.setMode('estimator'),

    editmode: () => sabaki.setMode(sabaki.state.mode === 'edit' ? 'play' : 'edit'),
    cleanmarkup: () => sabaki.openDrawer('cleanmarkup'),
    stonetool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'stone_1'})),
    crosstool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'cross'})),
    triangletool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'triangle'})),
    squaretool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'square'})),
    circletool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'circle'})),
    linetool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'line'})),
    arrowtool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'arrow'})),
    labeltool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'label'})),
    numbertool: () => (sabaki.setMode('edit'), sabaki.setState({selectedTool: 'number'})),
    copyvariation: () => sabaki.copyVariation(...sabaki.state.treePosition),
    cutvariation: () => sabaki.cutVariation(...sabaki.state.treePosition),
    pastevariation: () => sabaki.pasteVariation(...sabaki.state.treePosition),
    makemainvariation: () => sabaki.makeMainVariation(...sabaki.state.treePosition),
    shiftleft: () => sabaki.shiftVariation(...sabaki.state.treePosition, -1),
    shiftright: () => sabaki.shiftVariation(...sabaki.state.treePosition, 1),
    flatten: () => sabaki.flattenVariation(...sabaki.state.treePosition),
    removenode: () => sabaki.removeNode(...sabaki.state.treePosition),
    removeothervariations: () => sabaki.removeOtherVariations(...sabaki.state.treePosition),

    findmode: () => sabaki.setMode(sabaki.state.mode === 'find' ? 'play' : 'find'),
    findnext: () => (sabaki.setMode('find'), sabaki.findMove(1, {
        vertex: sabaki.state.findVertex,
        text: sabaki.state.findText
    })),
    findprevious: () => (sabaki.setMode('find'), sabaki.findMove(-1, {
        vertex: sabaki.state.findVertex,
        text: sabaki.state.findText
    })),
    togglehotspot: () => sabaki.setComment(...sabaki.state.treePosition, {
        hotspot: !('HO' in sabaki.state.treePosition[0].nodes[sabaki.state.treePosition[1]])
    }),
    nexthotspot: () => sabaki.findHotspot(1),
    previoushotspot: () => sabaki.findHotspot(-1),

    goback: () => sabaki.goStep(-1),
    goforward: () => sabaki.goStep(1),
    gotopreviousfork: () => sabaki.goToPreviousFork(),
    gotonextfork: () => sabaki.goToNextFork(),
    nextcomment: () => sabaki.goToComment(1),
    previouscomment: () => sabaki.goToComment(-1),
    gotobeginning: () => sabaki.goToBeginning(),
    gotoend: () => sabaki.goToEnd(),
    gotonextvariation: () => sabaki.goToSiblingVariation(1),
    gotopreviousvariation: () => sabaki.goToSiblingVariation(-1),
    gotomainvariation: () => sabaki.goToMainVariation(),
    gotomovenumber: () => dialog.showInputBox('Enter a move number to go to', ({value}) => {
        sabaki.closeDrawers()
        sabaki.goToMoveNumber(value)
    }),

    manageengines: () => (sabaki.setState({preferencesTab: 'engines'}), sabaki.openDrawer('preferences')),
    detachengine: () => null,
    generatemove: () => null,
    gtpconsole: () => null,
    clearconsole: () => null,

    toggleguessmode: () => sabaki.setMode(sabaki.state.mode === 'guess' ? 'play' : 'guess'),
    toggleautoplaymode: () => sabaki.setMode(sabaki.state.mode === 'autoplay' ? 'play' : 'autoplay'),
    togglecoordinates: () => setting.set('view.show_coordinates', !setting.get('view.show_coordinates')),
    toggleshownextmoves: () => setting.set('view.show_next_moves', !setting.get('view.show_next_moves')),
    toggleshowsiblings: () => setting.set('view.show_siblings', !setting.get('view.show_siblings')),
    toggleshowmovecolorization: () => setting.set('view.show_move_colorization', !setting.get('view.show_move_colorization')),
    togglegamegraph: () => setting.set('view.show_graph', !setting.get('view.show_graph')),
    togglecomments: () => setting.set('view.show_comments', !setting.get('view.show_comments')),
    togglefullscreen: () => sabaki.setState(({fullScreen}) => ({fullScreen: !fullScreen})),

    checkforupdates: () => ipcRenderer.send('check-for-updates', true),
    github: () => shell.openExternal(`https://github.com/yishn/${sabaki.appName}`),
    reportissue: () => shell.openExternal(`https://github.com/yishn/${sabaki.version}/issues`)
}

ipcRenderer.on('menu-click', (evt, action) => {
    sabaki.setState({showInputBox: false})
    menudata[action]()
})

ipcRenderer.on('load-file', (evt, ...args) => {
    setTimeout(() => sabaki.loadFile(...args), setting.get('app.loadgame_delay'))
})

ipcRenderer.on('window-focus', () => {
    if (setting.get('file.show_reload_warning')) {
        sabaki.askForReload()
    }
})
