var HTerm = function () {

    "use strict";


    var ellipsoids = {"1": "bessel", "2": "international", "3": "wgs84"};
    var ell_txt = "VALG AV ELLIPSOIDE.P SETTES LIK 1 FOR:\nNORSK BESSELS,LIK 2 FOR INTERNASJONAL:\nOG LIK 3 FOR WGS-84-ELLIPSOIDEN:\nLEGG INN P:";



    var Program = Backbone.View.extend({

        currentArg: null,

        running: false,

        args: [],

        cmd: function (command, term) {
            var arg = this.getArg(command);
            if (arg) {
                term.echo(arg);
            } else {
                this.doCompute(term);
            }
        },

        getArg: function (data) {
            if (this.args.length === 0) {
                return null;
            }
            var arg;
            if (this.currentArg === null) {
                this.currentArg = 0;
                arg = this.args[this.currentArg];
                return arg.text;
            } else if (this.currentArg < this.args.length) {
                arg = this.args[this.currentArg];
                arg.value = data;
                this.currentArg++;
                if (this.currentArg < this.args.length) {
                    arg = this.args[this.currentArg];
                    return arg.text;
                }
            }
            return null;
        },

        getRunning: function () {
            return this.running;
        },

        setRunning: function (running) {
            this.running = running;
        },

        doCompute: function (term) {
            this.running = false;
            term.set_prompt("holsenJS> ");
        },

        getValue: function (name) {
            return _.find(this.args, function (arg) {
                return arg.name === name;
            }).value;
        }
    });

    var ProgramWithSelection = Program.extend({

        getArg: function (data) {
            if (this.args.length === 0) {
                return null;
            }
            var arg;
            if (this.currentArg === null) {
                this.currentArg = 0;
                arg = this.args[this.currentArg];
                return arg.text;
            } else if (this.currentArg < this.args.length) {
                arg = this.args[this.currentArg];

                if (arg.name === "r") {
                    this.args = _.filter(this.args, function (arg) {
                        return (arg["for"] === undefined || arg["for"] === parseInt(data, 10));
                    });
                }

                arg.value = data;
                this.currentArg++;
                if (this.currentArg < this.args.length) {
                    arg = this.args[this.currentArg];
                    return arg.text;
                }
            }
            return null;
        }
    });

    var Krrad = Program.extend({
        args: [
            {"name": "p", "text": ell_txt},
            {"name": "br", "text": "Legg inn bredde for punkt :"},
            {"name": "a", "text": "Legg inn asimut for punkt :"}
        ],

        doCompute: function (term) {

            var p = this.getValue("p");
            var br = this.getValue("br");
            var a = this.getValue("a");

            var holsen = new Holsen();
            holsen.setEllipsoid(ellipsoids[p]);
            var data = holsen.krrad(parseFloat(br), parseFloat(a));
            term.echo("Meridiankrumningsradius M  = " + data.M + "\n" +
                "Normalkrumningsradius   N  = " + data.N  + "\n" +
                "Midlere krumningsradius MR = " + data.MR  + "\n" +
                "Krumningsradius i retning asimut AR = " + data.AR + "\n");
            Program.prototype.doCompute.apply(this, arguments);
        }
    });

    var Lgeo1 = Program.extend({
        args: [
            {"name": "b1", "text": "Legg inn b1 :"},
            {"name": "l1", "text": "Legg inn l1 :"},
            {"name": "s12", "text": "Legg inn s12 :"},
            {"name": "a12", "text": "Legg inn a12 :"},
            {"name": "p", "text": ell_txt}
        ],

        doCompute: function (term) {

            var b1 = this.getValue("b1");
            var l1 = this.getValue("l1");
            var s12 = this.getValue("s12");
            var a12 = this.getValue("a12");
            var p = this.getValue("p");

            var holsen = new Holsen();
            holsen.setEllipsoid(ellipsoids[p]);
            var data = holsen.lgeo1(parseFloat(l1), parseFloat(b1), parseFloat(s12), parseFloat(a12));
            term.echo('GEOGRAFISKE KOORDINATER:\n' +
                'B2:' + data.B2 + "\n" +
                'NEGATIV B2 BETYR SYDLIG BREDDE:\n\n' +
                'L2:' + data.L2 + '\n\n' +
                'ASIMUT FRA PUNKT 2 TIL PUNKT 1:\n' +
                'A2:' + data.A2 + '\n' +
                'PROGRAMMET REGNER A2 I FORHOLD TIL NORD,OGSÅ PÅ\n' +
                'DEN SYDLIGE HALVELLIPSOIDE');

            Program.prototype.doCompute.apply(this, arguments);
        }
    });

    var Lgeo2 = Program.extend({
        args: [
            {"name": "b1", "text": "Legg inn b1 :"},
            {"name": "l1", "text": "Legg inn l1 :"},
            {"name": "b2", "text": "Legg inn b2 :"},
            {"name": "l2", "text": "Legg inn l2 :"},
            {"name": "p", "text": ell_txt}
        ],

        doCompute: function (term) {

            var b1 = this.getValue("b1");
            var l1 = this.getValue("l1");
            var b2 = this.getValue("b2");
            var l2 = this.getValue("l2");
            var p = this.getValue("p");

            var holsen = new Holsen();
            holsen.setEllipsoid(ellipsoids[p]);
            var data = holsen.lgeo2(parseFloat(l1), parseFloat(b1), parseFloat(l2), parseFloat(b2));

            term.echo('ASIMUT FRA 1 TIL 2 OG FRA 2 TIL 1,I FORHOLD\n' +
                'TIL NORD OGSÅ PÅ DEN SYDLIGE HALVELLIPSOIDE\n' +
                'A1:' + data.A1 + '\n' +
                'A2:' + data.A2 + '\n ' +
                'GEODETISK LINJE FRA 1 TIL 2:\n' +
                'S:' + data.S);
            Program.prototype.doCompute.apply(this, arguments);
        }
    });

    var Meridbue = ProgramWithSelection.extend({
        args: [
            {"name": "r", "text": "R SETTES LIK 0 NÅR (B1,B2) ER GITT .I MOTSATT FALL SETTES R LIK 1 NÅR B1 0G G ER GITT'"},
            {"name": "p", "text": ell_txt},
            {"name": "b1", "text": "LEGG INN BREDDEN B1:"},
            {"name": "b2", "text": "LEGG INN BREDDEN B2:", "for": 0},
            {"name": "g", "text": "LEGG INN G:", "for": 1}
        ],

        doCompute: function (term) {
            var p = this.getValue("p");
            var holsen = new Holsen();
            holsen.setEllipsoid(ellipsoids[p]);

            var operation = parseInt(this.getValue("r"), 10);
            var b1 = parseFloat(this.getValue("b1"));
            if (operation === 0) {
                var b2 = parseFloat(this.getValue("b2"));
                term.echo('MERIDIANBUE =  ' + holsen.meridbue(b1, b2));
            } else if (operation === 1) {
                var g = parseFloat(this.getValue("g"));
                term.echo('BREDDE B2 =  ' + holsen.meridbue_inv(b1, g));
            }

            Program.prototype.doCompute.apply(this, arguments);
        }
    });

    var Konverg = ProgramWithSelection.extend({
        args: [
            {"name": "r", "text": "I SETTES LIK 1 NÅR (B,L) ER GITT OG 2 NÅR (X,Y) ER GITT'"},
            {"name": "p", "text": ell_txt},
            {"name": "l0", "text": "LEGG INN LENGDEGRADEN FOR FOR X-AKSEN:"},
            {"name": "b1", "text": "LEGG INN BREDDE:", "for": 1},
            {"name": "l1", "text": "LEGG INN LENGDE:", "for": 1},
            {"name": "b0", "text": "LEGG INN BREDDE FOR X-AKSENS NULLPUNKT:", "for": 2},
            {"name": "x", "text": "LEGG INN X:", "for": 2},
            {"name": "y", "text": "LEGG INN Y:", "for": 2},
            {"name": "s", "text": "S SETTES LIK 1 FOR NGO-SYSTEM OG LIK 2 FOR UTM:", "for": 2}
        ],

        doCompute: function (term) {
            var p = this.getValue("p");
            var holsen = new Holsen();
            holsen.setEllipsoid(ellipsoids[p]);

            var operation = parseInt(this.getValue("r"), 10);
            var l0 = parseFloat(this.getValue("l0"));
            if (operation === 1) {
                var b1 = parseFloat(this.getValue("b1"));
                var l1 = parseFloat(this.getValue("l1"));

                var c = holsen.konverg(b1, l1, l0);
                term.echo('C ER MERIDIANKONVERGENS I GON\n' +
                    'C: ' + c);

            } else if (operation === 2) {
                var coordsystems = {"1": "NGO", "2": "UTM"};
                var b0 = parseFloat(this.getValue("b0"));
                var x = parseFloat(this.getValue("x"));
                var y = parseFloat(this.getValue("y"));
                holsen.setCoordsystem(coordsystems[this.getValue("s")]);
                var res = holsen.konverg_xy(x, y, b0, l0);
                term.echo('C ER MERIDIANKONVERGENS I GON\n' +
                    'C: ' + res);
            }

            Program.prototype.doCompute.apply(this, arguments);
        }
    });

    var Blxy = ProgramWithSelection.extend({
        args: [
            {"name": "s", "text": "S SETTES LIK 0 FOR NGO-SYSTEM OG 1 FOR UTM.\nLEGG INN S:"},
            {"name": "r", "text": "R SETTES LIK 0 NÅR (B,L) ER GITT I MOTSATT FALL SETTES R LIK 1.\nLEGG INN R:"},
            {"name": "p", "text": ell_txt},
            {"name": "b0", "text": "LEGG INN  BREDDEN FOR X-AKSENS NULLPUNKT:"},
            {"name": "l1", "text": "LEGG INN GEOGRAFISK LENGDE FOR X-AKSEN:"},

            {"name": "br", "text": "LEGG INN GEOGRAFISK BREDDE:", "for": 0},
            {"name": "l", "text": "LEGG INN GEOGRAFISK LENGDE:", "for": 0},
            {"name": "x", "text": "LEGG INN X:", "for": 1},
            {"name": "y", "text": "LEGG INN Y:", "for": 1}

        ],

        doCompute: function (term) {
            var p = this.getValue("p");
            var holsen = new Holsen();
            holsen.setEllipsoid(ellipsoids[p]);

            var s = this.getValue("s");
            var coordsystems = {"0": "NGO", "1": "UTM"};
            holsen.setCoordsystem(coordsystems[s]);

            var operation = parseInt(this.getValue("r"), 10);
            var b0 = parseFloat(this.getValue("b0"));
            var l1 = parseFloat(this.getValue("l1"));

            if (operation === 0) {
                var br = parseFloat(this.getValue("br"));
                var l = parseFloat(this.getValue("l"));
                term.echo("HER STARTER BEREGNINGEN MED B OG L SOM KJENT");
                var res = holsen.bl_to_xy(l, br, l1, b0);
                term.echo("X:" + res.x);
                term.echo("Y:" + res.y);

            } else if (operation === 1) {
                var x = parseFloat(this.getValue("x"));
                var y = parseFloat(this.getValue("y"));
                term.echo("HER STARTER BEREGNINGEN MED KJENT X OG Y");
                var res2 = holsen.xy_to_bl(x, y, l1, b0);
                term.echo("GEOGRAFISKE KOORDINATER");
                term.echo("B:" + res2.lat);
                term.echo("L:" + res2.lon);
            }

            Program.prototype.doCompute.apply(this, arguments);
        }
    });

    var Terminal = Backbone.View.extend({

        programs: {
            "l-geo1": {
                "program": Lgeo1,
                "help": "BEREGNING AV GEOGRAFISKE KOORDINATER FOR PUNKT 2 OG ASIMUT FOR LINJEN I PUNKT 2"
            },
            "l-geo2": {
                "program": Lgeo2,
                "help": "GEOGRAFISKE KOORDINATER ER GITT FOR TO PUNKTER 1 OG 2,(B1,L1) OG(B2,L2).\n\t\tBEREGN GEODETISK LINJE FRA 1 TIL 2 OG ASIMUT I PUNKT 1 OG I PUNKT 2."
            },
            "krrad": {
                "program": Krrad,
                "help": "BEREGNING AV KRUMNINGSRADIER"
            },
            "meridbue": {
                "program": Meridbue,
                "help": "BEREGNING AV MERIDIANBUEN MELLOM BREDDE B1 OG B2\n\t\tELLER B2 NåR B1 OG MERIDIANBUEN G ER GITT"
            },
            "konverg": {
                "program": Konverg,
                "help": "PROGRAMMET BEREGNER PLAN MERIDIANKONVERGENS I GAUSS KONFORME PROJEKSJON OG UTM.\n\t\t(B,L) ELLER (X,Y) MÅ VÆRE GITT I DET AKTUELLE PUNKT"
            },
            "blxy": {
                "program": Blxy,
                "help": "BEREGING AV PLANE KOORDINATER (X,Y) AV GEOGRAFISKE(B,l) OG OMVENDT."
            }
        },

        program: null,

        cmd: function (command, term) {
            if (this.program && this.program.getRunning()) {
                this.program.cmd(command, term, this);
            } else {
                term.set_prompt("holsenJS> ");
                if (command === "help") {
                    term.echo("Available commands are:");
                    _.each(this.programs, function (program, key) {
                        term.echo("\t" + key + ":\n\t\t" + program.help);
                    });
                } else if (this.programs[command]) {
                    this.program = new this.programs[command].program();
                    this.program.setRunning(true);
                    term.set_prompt(command + "> ");
                    this.cmd(command, term);
                } else {
                    term.echo("Invalid command: " + command);
                }
            }
        }
    });

    var createTerminal = function (element) {
        jQuery(function ($, undefined) {

            var terminal = new Terminal();
            element.terminal(function (command, term) {
                terminal.cmd(command, term);
            },
                {
                    greetings: 'Holsens smaaprog in JavaScript',
                    name: 'js_demo',
                    height: 600,
                    width: 600,
                    prompt: 'holsenJS> ',
                    enabled: false
                }
                );

            $(document).click(function (e) {
                if($(e.target).attr("id") === "term_demo") {
                    element.enable();
                } else {
                    element.disable();
                }
            });
        });
    };

    return {
        "createTerminal": createTerminal
    };
};