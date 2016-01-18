define(['Models/plugin'], function (Model) {

    describe("Tested plugin", function(){

        var testedPlugin = Model.modules.Plugin;

        beforeEach(function(){
            this.instancePlugin = new testedPlugin();
        });

        it("Tested plugin MUST BE DEFINED", function(){
            expect(testedPlugin).toBeDefined();
        });


        describe("Method initialize", function(){
            it("Method initialize MUST BE DEFINED", function(){
                expect(this.instancePlugin.initialize).toBeDefined();
            });

        });

        describe("Method render", function(){
            it("Method render MUST BE DEFINED", function(){
                expect(this.instancePlugin.render).toBeDefined();
            });
        })
    });


});