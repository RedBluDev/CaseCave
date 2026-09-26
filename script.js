//function definitions
const rng = (a, b) => b == undefined ? a : Math.floor(Math.random() * (Math.abs(a - b) + 1)) + Math.min(a, b);

const fys = a => {
    let b = [...a];
    for(let l = b.length - 1; l > 0; l--){
        let r = rng(0, l);
        [b[l], b[r]] = [b[r], b[l]]
    };
    return b
};

const createArray = (input, filter) => {
    const output = [];
    const elements = [input];
    const path = [];
    const loops = [];
    do{
        while(true){
            let e = elements[elements.length - 1];
            if(Array.isArray(e)){
                if(e.length != 0){
                    path.push(0);
                    elements.push(e[0])
                } else break
            } else if(e.loop != undefined){
                loops.push(rng(...e.repeat));
                elements.push(e.loop)
            } else if(e.random != undefined){
                let f = e.random.filter(filter ?? (() => true));
                let n = rng(1, f.reduce((a, v) => a + v.chance, 0));
                let c = 0;
                elements.push(f.find(o => {c += o.chance; return n <= c}).element)
            } else {
                output.push(e);
                break
            }
        };
        while(true){
            let p = elements[elements.length - 2];
            if(p == undefined) break;
            if(Array.isArray(p)){
                if(p[path[path.length - 1] + 1] == undefined){
                    elements.pop();
                    path.pop()
                } else {
                    path[path.length - 1]++;
                    elements[elements.length - 1] = p[path[path.length - 1]];
                    break
                }
            } else if(p.loop != undefined){
                loops[loops.length - 1]--;
                if(loops[loops.length - 1] == 0){
                    elements.pop();
                    loops.pop()
                } else break
            } else elements.pop();
        }
    }while(elements[1] != undefined);
    return(output)
};

const updateBigDiv = obj => Object.keys(obj).forEach(k => {
    let par = document.getElementById(k);
    obj[k].forEach((e, i) => {if(e != undefined){
        let [div, chn, img, lbl, ord] = [];
        if(par.children[i] == undefined){
            div = document.createElement("DIV");
            chn = div.children;
            ord = true;
            img = document.createElement("IMG");
            lbl = document.createElement("LABEL");
            div.className = "smlDiv";
            div.append(img, lbl);
            par.append(div)
        } else {
            div = par.children[i];
            chn = div.children;
            ord = chn[0].tagName == "IMG";
            [img, lbl] = ord ? [chn[0], chn[1]] : [chn[1], chn[0]];
        };
        if(e[2] != undefined && e[2] != ord) div.append(div.removeChild(chn[0]));
        if(e[0] != undefined) img.src = e[0] == "" ? "" : "images/" + e[0] + ".png";
        if(e[1] != undefined) lbl.textContent = e[1];
        if(e[3] != undefined) div.id = e[3]
    }})
});

const updateSmlDiv = obj => Object.keys(obj).forEach(k => {
    let div = document.getElementById(k);
    let chn = div.children;
    let ord = chn[0].tagName == "IMG";
    let [img, lbl] = ord ? [chn[0], chn[1]] : [chn[1], chn[0]];
    if(obj[k][2] != undefined && obj[k][2] != ord) div.append(div.removeChild(chn[0]));
    if(obj[k][0] != undefined) img.src = obj[k][0] == "" ? "" : "images/" + obj[k][0] + ".png";
    if(obj[k][1] != undefined) lbl.textContent = obj[k][1];
    if(obj[k][3] != undefined) img.id = obj[k][3];
    if(obj[k][4] != undefined) lbl.id = obj[k][4]
});

const updateLbl = obj => Object.keys(obj).forEach(k => document.getElementById(k).textContent = obj[k]);

const updateImg = obj => Object.keys(obj).forEach(k => document.getElementById(k).src = obj[k] == "" ? "" : "images/" + obj[k] + ".png");

const show = (...ids) => ids.forEach(id => document.getElementById(id).classList.remove("hidden"));

const hide = (...ids) => ids.forEach(id => document.getElementById(id).classList.add("hidden"));

const clear = (...ids) => ids.forEach(id => document.getElementById(id).replaceChildren());

const destroy = (...ids) => ids.forEach(id => document.getElementById(id).remove());

const navigate = l => {
    hide(...(Array.from(document.getElementById("CaseCave").children).map(e => e.id)));
    show("bgImg", ...gameLayers[l].nodes, ...(Object.keys(gameLayers[l].btns).map(k => ({up: "navUp", dn: "navDn", lt: "navLt", rt: "navRt", fd: "navFd", bd: "navBd", cr: "centerBtn"})[k])));
    updateImg({bgImg: mainData[taskType][gameLayers[l].bg]});
    layer = l;
    gameLayers[l].fn?.()
};

const selectCase = t => {
    caseType = t;
    hits = player[t] == 0 ? -1 : rng(...caseData[t].hits)
};

const selectTask = t => {
    taskType = t;
    task = questData[t]
};


//variable definitions
let unlocks;
let lootUnlocks;
let player;
let dealer;

let index = 0;
let seed = 0;
let choice = 0;

let dropData;
let initData;
let dealData;
let dealerData;

let task;
let deal;

let looted = true;
let verified = false;

let layer;
let shop = false;
let taskPage = 0;
let casePage = 0;

let caseType;
let taskType;

let hits;
let drop;


//data definitions
let gameLayers = {
    openLayer: {bg: 2, nodes: ["cornerDiv1", "cornerDiv2", "cornerDiv3", "cornerDiv4", "centerDiv1", "centerDiv2"], btns: {
        cr: () => {
            if(hits != 0){
                hits--;
                updateLbl({hitsLbl: hits})
            } else {
                if(player[caseType] != null) player[caseType]--;
                player.casesOpened++;
                destroy("hitsCount");
                shop = false;
                dropData = createArray(caseData[caseType].loot, e => lootUnlocks[caseType][e.id] ?? true);
                drop = dropData.length;
                navigate("lootLayer")
            }
        },
        up: () => {
            navigate("mainLayer")
        },
        dn: () => {
            clear("cornerDiv1", "cornerDiv2");
            updateBigDiv({
                itemColumn1: miscData.itemColumn1.map(i => [...((unlocks[i] ?? true) ? [mainData[i][(player[i] ?? true) ? 1 : 0], typeof player[i] == "boolean" ? "" : (player[i] ?? '∞')] : ["item-unknown", typeof player[i] == "boolean" ? "" : '?'])]),
                itemColumn2: miscData.itemColumn2.map(i => [...((unlocks[i] ?? true) ? [mainData[i][(player[i] ?? true) ? 1 : 0], typeof player[i] == "boolean" ? "" : (player[i] ?? '∞')] : ["item-unknown", typeof player[i] == "boolean" ? "" : '?'])]),
                itemColumn3: miscData.itemColumn3.map(i => [...((unlocks[i] ?? true) ? [mainData[i][(player[i] ?? true) ? 1 : 0], typeof player[i] == "boolean" ? "" : (player[i] ?? '∞')] : ["item-unknown", typeof player[i] == "boolean" ? "" : '?'])]),
                toolRow: miscData.toolRow.map(        i => [...((unlocks[i] ?? true) ? [mainData[i][(player[i] ?? true) ? 1 : 0], typeof player[i] == "boolean" ? "" : (player[i] ?? '∞')] : ["item-unknown", typeof player[i] == "boolean" ? "" : '?'])]),
                cornerDiv1: [[mainData.casesOpened[player.casesOpened ? 1 : 0], player.casesOpened, true]],
                cornerDiv2: [[mainData.itemsLooted[player.itemsLooted ? 1 : 0], player.itemsLooted, false]]
            });
            navigate("itemLayer")
        },
        lt: () => {
            clear("centerDiv1", "cornerDiv1", "cornerDiv2");
            navigate("caseLayer")
        },
        rt: () => {
            clear("centerDiv1", "cornerDiv1", "cornerDiv2");
            navigate("taskLayer")
        },
        bd: () => {
            updateImg({centerBtn: "chr-vaultkeeper"});
            navigate("vault")
        },
        fd: () => {
            destroy("hitsCount");
            shop = true;
            drop = -1;
            navigate("lootLayer")
        }
    }, fn: () => {
        clear("centerDiv1", "centerDiv2", "cornerDiv1", "cornerDiv2", "cornerDiv3", "cornerDiv4");
        let cornerDiv1 = [];
        let cornerDiv2 = [];
        if(player[taskType]){
            Object.keys(task.numUnlocks ?? {}).forEach(k => {
                let l = task.numUnlocks[k].length;
                let m = task.numUnlocks[k].filter(n => n > 0).length;
                if(m > 0) cornerDiv1.push([(unlocks[k] ?? true) ? mainData[k][3] : "case-unknown3", '+' + m, true]);
                if(l - m > 0) cornerDiv2.push([(unlocks[k] ?? true) ? mainData[k][3] : "case-unknown3", '-' + m, false])
            });
            updateBigDiv({
                cornerDiv1: [...cornerDiv1, ...((task.blnUnlocks ?? []).map(t => [mainData[t][1], "", true]))],
                cornerDiv2: [...cornerDiv2, ...((task.blnLocks ?? []).map(t => [mainData[t][1], "", false]))]
            })
        } else {
            Object.keys(task.num ?? {}).forEach(k => {
                cornerDiv1.push([...((unlocks[k] ?? true) ? [mainData[k][player[k] ?? (task.num[k] > 0) ? 1 : 0], player[k] ?? (task.num[k] > 0 ? '∞' : 0), true] : ["item-unknown", '?', true])]);
                cornerDiv2.push([(unlocks[k] ?? true) ? mainData[k][task.num[k] ? 1 : 0] : "item-unknown", (task.num[k] > 0 ? "≥" : "≤") + task.num[k], false])
            });
            updateBigDiv({
                cornerDiv1: [...cornerDiv1,
                    ...((task.blnT ?? []).map(t => [...((unlocks[k] ?? true) ? [mainData[t][(player[t] ?? true) ? 1 : 0], "", true] : ["item-unknown", "", true])])),
                    ...((task.blnF ?? []).map(t => [...((unlocks[k] ?? true) ? [mainData[t][(player[t] ?? false) ? 1 : 0], "", true] : ["item-unknown", "", true])]))
                ],
                cornerDiv2: [...cornerDiv2,
                    ...((task.blnT ?? []).map(t => [(unlocks[k] ?? true) ? mainData[t][1] : "item-unknown", "", false])),
                    ...((task.blnF ?? []).map(t => [(unlocks[k] ?? true) ? mainData[t][0] : "item-unknown", "", false]))
                ]
            });
        };
        updateBigDiv({
            centerDiv1: [["", hits, true, "hitsCount"]],
            centerDiv2: [[mainData[caseType][(player[caseType] ?? true) ? 1 : 0], player[caseType] ?? '∞', true, "caseCount"]]
        });
        updateSmlDiv({hitsCount: [undefined, undefined, false, undefined, "hitsLbl"]});
        updateImg({centerBtn: mainData[caseType][(player[caseType] ?? true) ? 1 : 0]})
    }},
    lootLayer: {bg: 3, nodes: ["cornerDiv1", "cornerDiv2", "cornerDiv3", "cornerDiv4", "centerDiv1", "centerDiv2", "skip"], btns: {
        cr: () => {
            if(verified && 
                deal.pBlnTrades.filter(t => !(dealer[t] ?? true)).length == 0 &&
                deal.dBlnTrades.filter(t => !(player[t] ?? true)).length == 0 &&
                Object.keys(deal.numTrades).filter(k => deal.numTrades[k] < 0 ? (player[k] ?? Infinity) < -deal.numTrades[k] : (dealer[k] ?? Infinity) < deal.numTrades[k]).length == 0
            ){
                Object.keys(deal.numTrades).forEach(k => {
                    if(player[k] != null) player[k] += deal.numTrades[k];
                    if(dealer[k] != null) dealer[k] -= deal.numTrades[k]
                });
                deal.pBlnTrades.forEach(t => {
                    if(player[t] != null) player[t] = true;
                    if(dealer[t] != null) dealer[t] = false
                });
                deal.dBlnTrades.forEach(t => {
                    if(player[t] != null) player[t] = false;
                    if(dealer[t] != null) dealer[t] = true
                });
                if(
                    Object.keys(task.num ?? {}).filter(k => task.num[k] < 0 ? -task.num[k] < (player[k] ?? 0) : task.num[k] > (player[k] ?? Infinity)).length == 0 &&
                    (task.blnT ?? []).filter(t => !(player[t] ?? true)).length == 0 &&
                    (task.blnF ?? []).filter(t => !(player[t] ?? false)).length == 0
                ){
                    Object.keys(task.numUnlocks ?? {}).forEach(k => task.numUnlocks[k].forEach(l => {if(l > 0){lootUnlocks[k][l] = true} else {lootUnlocks[k][-l] = false}}));
                    (task.blnUnlocks ?? []).forEach(t => {if(unlocks[t] != null) unlocks[t] = true});
                    (task.blnLocks  ??  []).forEach(t => {if(unlocks[t] != null) unlocks[t] = false});
                    player[taskType] = true
                };
                if(!shop){
                    drop--;
                    looted = true
                };
                player.itemsLooted++;
                navigate("lootLayer")
            }
        },
        up: () => {
            index++;
            navigate("lootLayer")
        },
        dn: () => {
            index--;
            navigate("lootLayer")
        },
        lt: () => {
            choice--;
            navigate("lootLayer")
        },
        rt: () => {
            choice++;
            navigate("lootLayer")
        },
        bd: () => {
            looted = true;
            navigate("openLayer")
        }
    }, fn: () => {
        if(drop != 0){
            if(looted){
                choice = 0;
                index = 0;
                looted = false;
                dealer = {};
                if(shop){
                    initData = {type: "shop", choice: [0, 0]};
                    seed = 0
                } else {
                    initData = dropData[dropData.length - drop];
                    seed = rng(...initData.seed);
                    dealerData = lootData[initData.type].dealer ?? {};
                    Object.keys(dealerData).forEach(l => {
                        dealer[l] = {};
                        dealer[l] = typeof dealerData[l] == "object" ?
                        (dealerData[l].seed ?? 0) * seed + (dealerData[l].add ?? 0) : dealerData[l];
                    });
                }
            };
            hide(shop ? "skip" : "navBd");
            dealData = lootData[initData.type].deals[index] ?? {};
            deal = {
                pNum: {},
                dNum: {},
                numTrades: {},
                pBlnT: dealData.pBlnT ?? [],
                dBlnT: dealData.dBlnT ?? [],
                pBlnF: dealData.pBlnF ?? [],
                dBlnF: dealData.dBlnF ?? [],
                pBlnTrades: dealData.pBlnTrades ?? [],
                dBlnTrades: dealData.dBlnTrades ?? []
            };
            ["pNum", "dNum", "numTrades"].forEach(k => {
                Object.keys(dealData[k] ?? {}).forEach(l => {
                    deal[k][l] = typeof dealData[k][l] == "object" ?
                    (dealData[k][l].seed ?? 0) * seed +
                    (dealData[k][l].choice ?? 0) * choice +
                    (dealData[k][l].add ?? 0) : dealData[k][l];
                })
            });
            Object.keys(dealData.numTrades ?? {}).forEach(l => {
                if(typeof dealData.numTrades[l] == "object" && !(dealData.numTrades[l].req ?? true)) deal.numTrades[l] = deal.numTrades[l] < 0 ?
                -Math.min(-deal.numTrades[l], player[l] ?? Infinity) : Math.min(deal.numTrades[l], dealer[l] ?? Infinity)
            });
            verified = (
                Object.keys(deal.pNum).filter(l => deal.pNum[l] < 0 ? -deal.pNum[l] < (player[l] ?? 0) : deal.pNum[l] > (player[l] ?? Infinity)).length == 0 &&
                Object.keys(deal.dNum).filter(l => deal.dNum[l] < 0 ? -deal.dNum[l] < (dealer[l] ?? 0) : deal.dNum[l] > (dealer[l] ?? Infinity)).length == 0 &&
                deal.pBlnT.filter(t => !(player[t] ?? true)).length == 0 &&
                deal.dBlnT.filter(t => !(dealer[t] ?? true)).length == 0 &&
                deal.pBlnF.filter(t => (player[t] ?? false)).length == 0 &&
                deal.dBlnF.filter(t => (dealer[t] ?? false)).length == 0
            );
            let centerDiv1 = [];
            let centerDiv2 = [];
            let cornerDiv1 = [];
            let cornerDiv2 = [];
            let cornerDiv3 = [];
            let cornerDiv4 = [];
            clear("centerDiv1", "centerDiv2", "cornerDiv1", "cornerDiv2", "cornerDiv3", "cornerDiv4");
            if(verified){
                updateImg({centerBtn: dealData.img1 ?? (shop ? "case-shop3" : mainData[caseType][3])});
                Object.keys(deal.numTrades).forEach(k => {
                    if(deal.numTrades[k] < 0){
                        centerDiv1.push([(unlocks[k] ?? true) ? mainData[k][1] : "item-unknown", deal.numTrades[k], false]);
                        cornerDiv2.push([...((unlocks[k] ?? true) ? [mainData[k][(player[k] ?? true) ? 1 : 0], player[k] ?? '∞', false] : ["item-unknown", '?', false])])
                    } else if(deal.numTrades[k] > 0){
                        centerDiv2.push([(unlocks[k] ?? true) ? mainData[k][1] : "item-unknown", '+' + deal.numTrades[k], false]);
                        cornerDiv1.push([...((unlocks[k] ?? true) ? [mainData[k][(player[k] ?? true) ? 1 : 0], player[k] ?? '∞', true] : ["item-unknown", '?', true])]);
                        cornerDiv4.push([...((unlocks[k] ?? true) ? [mainData[k][(dealer[k] ?? true) ? 1 : 0], dealer[k] ?? '∞', false] : ["item-unknown", '?', false])])
                    }
                });
                updateBigDiv({
                    centerDiv1: [...centerDiv1, ...deal.dBlnTrades.map(t => [(unlocks[t] ?? true) ? mainData[t][1] : "item-unknown", '-', false])],
                    centerDiv2: [...centerDiv2, ...deal.pBlnTrades.map(t => [(unlocks[t] ?? true) ? mainData[t][1] : "item-unknown", '+', false])],
                    cornerDiv1: [...cornerDiv1, ...deal.pBlnTrades.map(t => [...((unlocks[t] ?? true) ? [mainData[t][(player[t] ?? true) ? 1 : 0], "", true] : ["item-unknown", '?', true])])],
                    cornerDiv2: [...cornerDiv2, ...deal.dBlnTrades.map(t => [...((unlocks[t] ?? true) ? [mainData[t][(player[t] ?? true) ? 1 : 0], "", false] : ["item-unknown", '?', false])])],
                    cornerDiv3: [...cornerDiv3],
                    cornerDiv4: [...cornerDiv4, ...deal.pBlnTrades.map(t => [...((unlocks[t] ?? true) ? [mainData[t][(dealer[t] ?? true) ? 1 : 0], "", false] : ["item-unknown", '?', false])])]
                });
            } else {
                updateImg({centerBtn: dealData.img0 ?? (shop ? "case-shop2" : mainData[caseType][2])});
                Object.keys(deal.pNum).forEach(k => {if(deal.pNum[k] != 0){
                    centerDiv1.push([(unlocks[k] ?? true) ? mainData[k][deal.pNum[k] ? 1 : 0] : "item-unknown", (deal.pNum[k] > 0 ? "≥" : "≤") + deal.pNum[k], false]);
                    cornerDiv1.push([...((unlocks[k] ?? true) ? [mainData[k][player[k] ?? (deal.pNum[k] > 0) ? 1 : 0], player[k] ?? (deal.pNum[k] > 0 ? '∞' : 0), true] : ["item-unknown", '?', true])])
                }});
                Object.keys(deal.dNum).forEach(k => {if(deal.dNum[k] != 0){
                    centerDiv2.push([(unlocks[k] ?? true) ? mainData[k][deal.dNum[k] ? 1 : 0] : "item-unknown", (deal.dNum[k] > 0 ? "≥" : "≤") + deal.dNum[k], false]);
                    cornerDiv4.push([...((unlocks[k] ?? true) ? [mainData[k][dealer[k] ?? (deal.dNum[k] > 0) ? 1 : 0], dealer[k] ?? (deal.dNum[k] > 0 ? '∞' : 0), false] : ["item-unknown", '?', false])])
                }});
                updateBigDiv({
                    centerDiv1: [...centerDiv1,
                        ...deal.pBlnT.map(t => [(unlocks[t] ?? true) ? mainData[t][1] : "item-unknown", "", false]),
                        ...deal.pBlnF.map(t => [(unlocks[t] ?? true) ? mainData[t][0] : "item-unknown", "", false])
                    ],
                    centerDiv2: [...centerDiv2,
                        ...deal.dBlnT.map(t => [(unlocks[t] ?? true) ? mainData[t][1] : "item-unknown", "", false]),
                        ...deal.dBlnF.map(t => [(unlocks[t] ?? true) ? mainData[t][0] : "item-unknown", "", false])
                    ],
                    cornerDiv1: [...cornerDiv1,
                        ...deal.pBlnT.map(t => [...((unlocks[t] ?? true) ? [mainData[t][(player[t] ?? true) ? 1 : 0], "", true] : ["item-unknown", "", true])]),
                        ...deal.pBlnF.map(t => [...((unlocks[t] ?? true) ? [mainData[t][(player[t] ?? false) ? 1 : 0], "", true] : ["item-unknown", "", true])])
                    ],
                    cornerDiv2: [...cornerDiv2],
                    cornerDiv3: [...cornerDiv3],
                    cornerDiv4: [...cornerDiv4,
                        ...deal.dBlnT.map(t => [...((unlocks[t] ?? true) ? [mainData[t][(dealer[t] ?? true) ? 1 : 0], "", false] : ["item-unknown", "", false])]),
                        ...deal.dBlnF.map(t => [...((unlocks[t] ?? true) ? [mainData[t][(dealer[t] ?? false) ? 1 : 0], "", false] : ["item-unknown", "", false])])
                    ]
                })
            };
            if(choice == initData.choice[0]) hide("navLt");
            if(choice == initData.choice[1]) hide("navRt");
            if(index == lootData[initData.type].deals.length - 1) hide("navUp");
            if(index == 0) hide("navDn")
        } else {
            selectCase(caseType);
            navigate("openLayer")
        }
    }},
    mainLayer: {bg: 4, nodes: ["logoImg", "load", "save", "reset", "socialDiv1", "socialDiv2"], btns: {
        dn: () => navigate("openLayer")
    }, fn: () => {}},
    itemLayer: {bg: 5, nodes: ["itemColumn1", "itemColumn2", "itemColumn3", "toolRow", "cornerDiv1", "cornerDiv2"], btns: {
        up: () => navigate("openLayer")
    }, fn: () => {}},
    taskLayer: {bg: 6, nodes: ["cornerDiv2"], btns: {
        up: () => {
            taskPage++;
            navigate("taskLayer")
        },
        dn: () => {
            taskPage--;
            navigate("taskLayer")
        },
        lt: () => {
            if(miscData.tasks[taskPage] != taskType) selectTask(miscData.tasks[taskPage]);
            navigate("openLayer")
        }
    }, fn: () => {
        if(taskPage == 0) hide("navDn");
        if(taskPage == miscData.tasks.length - 1) hide("navUp");
        if(unlocks[miscData.tasks[taskPage]] ?? true){
            updateImg({bgImg: mainData[miscData.tasks[taskPage]][gameLayers.taskLayer.bg]});
            updateBigDiv({cornerDiv2: [[mainData[miscData.tasks[taskPage]][(player[miscData.tasks[taskPage]] ?? true) ? 1 : 0], "", false]]})
        } else {
            hide("navLt");
            updateImg({bgImg: "bg-unknown"});
            updateBigDiv({cornerDiv2: [["task-unknown", "", false]]})
        }
    }},
    caseLayer: {bg: 7, nodes: ["centerDiv2"], btns: {
        cr: () => {},
        up: () => {
            casePage++;
            navigate("caseLayer")
        },
        dn: () => {
            casePage--;
            navigate("caseLayer")
        },
        rt: () => {
            if(miscData.cases[casePage] != caseType) selectCase(miscData.cases[casePage]);
            navigate("openLayer")
        }
    }, fn: () => {
        if(casePage == 0) hide("navDn");
        if(casePage == miscData.cases.length - 1) hide("navUp");
        if(unlocks[miscData.cases[casePage]] ?? true){
            updateImg({centerBtn: mainData[miscData.cases[casePage]][(player[miscData.cases[casePage]] ?? true) ? 1 : 0]});
            updateBigDiv({centerDiv2: [[mainData[miscData.cases[casePage]][(player[miscData.cases[casePage]] ?? true) ? 1 : 0], player[miscData.cases[casePage]] ?? '∞', true]]})
        } else {
            hide("navRt");
            updateImg({centerBtn: "case-unknown1"});
            updateBigDiv({centerDiv2: [["case-unknown1", '?', true]]})
        }
    }},
    vault: {bg: 8, nodes: [], btns: {
        cr: () => (miscData.codes[prompt("What brought you here today?", "Who are you?")] ?? ["I do not seem to have that information..."]).forEach(alert),
        fd: () => navigate("openLayer")
    }, fn: () => {}}
};
let startData;
let mainData;
let miscData;
let caseData;
let lootData;
let questData;


//initialization
(async () => {
    let data = [];
    let promises = ["startData", "mainData", "miscData", "caseData", "lootData", "questData"].map(async (f, i) => data[i] = (await (await fetch("data/" + f + ".json")).json()));
    await Promise.all(promises);
    [startData, mainData, miscData, caseData, lootData, questData] = data;
    if(localStorage.CaseCave == undefined) localStorage.CaseCave = JSON.stringify(startData);
    ({unlocks, lootUnlocks, player} = structuredClone(startData));
    selectCase(miscData.cases[0]);
    selectTask(miscData.tasks[0]);
    navigate("mainLayer");
    show("CaseCave");
    document.getElementById("centerBtn").addEventListener("click", () => gameLayers[layer].btns.cr?.());
    document.getElementById("navUp"    ).addEventListener("click", () => gameLayers[layer].btns.up?.());
    document.getElementById("navDn"    ).addEventListener("click", () => gameLayers[layer].btns.dn?.());
    document.getElementById("navLt"    ).addEventListener("click", () => gameLayers[layer].btns.lt?.());
    document.getElementById("navRt"    ).addEventListener("click", () => gameLayers[layer].btns.rt?.());
    document.getElementById("navBd"    ).addEventListener("click", () => gameLayers[layer].btns.bd?.());
    document.getElementById("navFd"    ).addEventListener("click", () => gameLayers[layer].btns.fd?.());
    document.getElementById("load"     ).addEventListener("click", () => {
        ({unlocks, lootUnlocks, player} = JSON.parse(localStorage.CaseCave));
        casePage = 0;
        taskPage = 0;
        selectCase(miscData.cases[0]);
        selectTask(miscData.tasks[0])
    });
    document.getElementById("save"     ).addEventListener("click", () => {
        localStorage.CaseCave = JSON.stringify({unlocks, lootUnlocks, player})
    });
    document.getElementById("reset"    ).addEventListener("click", () => {
        ({unlocks, lootUnlocks, player} = structuredClone(startData));
        casePage = 0;
        taskPage = 0;
        selectCase(miscData.cases[0]);
        selectTask(miscData.tasks[0])
    });
    document.getElementById("skip"     ).addEventListener("click", () => {
        looted = true;
        localStorage.CaseCave = JSON.stringify(startData);
        ({unlocks, lootUnlocks, player} = structuredClone(startData));
        casePage = 0;
        taskPage = 0;
        selectCase(miscData.cases[0]);
        selectTask(miscData.tasks[0]);
        navigate("mainLayer")
    });
    document.addEventListener("keydown", e => {if(e.repeat) return;
        let btn = document.getElementById(({w: "navUp", s: "navDn", a: "navLt", d: "navRt", q: "navBd", e: "navFd", ' ': "centerBtn", 1: "skip", 2: "load", 3: "save", 4: "reset"})[e.key]);
        if(btn == null || btn.classList.contains("hidden")) return;
        btn.click()
    })
})()