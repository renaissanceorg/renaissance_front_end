import Exercise from "../../objects/exercise";
import ExerciseQA from "../../objects/exerciseQA";
import ContentItems from "../../objects/contentItems";
import Snack from '../../../node_modules/snack.js/dist/snack'

import invert from 'invert-object'
import Exercises from "../../objects/exercises";

export default {
    template: require('./newExercise.html'),
    created () {
        var me = this
        this.items = {} // [{breadcrumb: "Spanish > Hola", id: 'a12345'},{breadcrumb: "Spanish > Senorita", id: 'b23456'}]
        // this.itemIds = {12345: true} //[12345]
        this.selectedItems = []
        this.selectedItemIds = []
        this.question=""
        this.answer=""
        this.tags = null
        //TODO: replace with Vuex/redux store . . . or maybe a routing system
        if (window.exerciseToReplaceId){
            Exercises.get(window.exerciseToReplaceId).then(exercise => {
                me.question = exercise.question
                me.answer = exercise.answer
                me.selectedItemIds = Object.keys(exercise.contentItemIds)
            })
        }


        // this.factsAndSkills = [{breadcrumb: "<span>Spanish > Hola<span item-id='12345'></span></span>", id: '12345'},{breadcrumb: "Spanish > Senorita", id: '23456'}]

        ContentItems.getAllExceptForHeadings().then(items => {
            this.items = items
            var breadcrumbIdMap = Object.keys(this.items).reduce((map, key) => {
                var item = items[key]
                var breadCrumb = item.getBreadCrumbsString()
                map[breadCrumb] = item.id
                return map
            },{})
            var idBreadcrumbMap = invert(breadcrumbIdMap)
            this.idBreadcrumbMap = idBreadcrumbMap
            this.breadcrumbIdMap = breadcrumbIdMap
            initTagSearch()
        })
        // hacky solution, but each breadcrumb should be uniquely mapped to a contentId so i guess no big deal

        function initTagSearch(){
            setTimeout(function() {
                me.tags = new Taggle($('.new-exercise-items.textarea')[0], {
                    duplicateTagClass: 'bounce',
                    onTagRemove: function(event,breadcrumb){
                        var id = me.breadcrumbIdMap[breadcrumb]
                        var index = me.selectedItemIds.indexOf(id)
                        me.selectedItemIds.splice(index,1)
                        delete me.selectedItemIds[id]
                    }
                });
                me.selectedItemIds.map(id => {
                    return me.idBreadcrumbMap[id]
                }).forEach(existingBreadcrumb => {
                    console.log('existing breadcrumb', existingBreadcrumb)
                    me.tags.add(existingBreadcrumb)
                    // me.tags.add
                })

                var container = me.tags.getContainer();
                var input = me.tags.getInput();

                $(input).autocomplete({
                    source: Object.keys(me.breadcrumbIdMap), //me.items.map( x => x.breadcrumb),
                    appendTo: container,
                    position: { at: 'left bottom', of: container },
                    select: function(e, v) {
                        console.log("added! at start selectedItemIds is ", me.selectedItemIds)
                        e.preventDefault();
                        // Add the tag if user clicks
                        if (e.which === 1) {
                            var breadcrumb = v.item.value
                            var id = me.breadcrumbIdMap[breadcrumb]
                            var alreadyExists = me.selectedItemIds.find(itemId => itemId == id)
                            if (alreadyExists) return
                            me.selectedItemIds.push(id) //[id.toString()] = true
                            me.tags.add(breadcrumb);
                            console.log('me selectedItemIds is now', me.selectedItemIds)
                        }
                    }
                });
            },0)
        }

    },
    data () {
        return {
            items: this.items,
            question: this.question,
            answer: this.answer,
            selectedItems: this.selectedItems,
            selectedItemIds: this.selectedItemIds,
            factsAndSkills: [],
            itemIds: this.itemIds,
            type: 'fact',
            window,
        }
    },
    computed: {
        selectedBreadcrumbs() {
            var me = this
            const selectedBreadcrumbs = Object.keys(this.selectedItemIds).map(id =>  {
                var breadcrumb = me.idBreadcrumbMap[id]
                console.log('id and breadcrumb are ', id, breadcrumb)
                return breadcrumb
            })
            console.log(
                'selected bread crumbs and itemIds are', selectedBreadcrumbs, this.selectedItemIds, me.idBreadcrumbMap
            )
            return selectedBreadcrumbs
        },
    },
    methods: {
        getExerciseData(){
            const exerciseData = {
                question: this.question,
                answer: this.answer,
                contentItemIds:
                    this.selectedItemIds.reduce((obj,key) => {
                        obj[key] = true;
                        return obj
                    }, {})
            }
            return exerciseData
        },
        createExercise() {
            const exerciseData = this.getExerciseData()
            //TODO allow creation of other types of exercises than QA
            const exercise = ExerciseQA.create(exerciseData)

            this.selectedItemIds.forEach(id => {
               ContentItems.get(id).then(contentItem => {
                   contentItem.addExercise(exercise.id)
               })
            })

            var snack = new Snack({
               domParent: document.querySelector('.new-exercise')
            });
            // show a snack for 4s
            snack.show('Exercise created!', 4000);

            //clear exercise
            this.selectedItemIds = []
            this.question = ""
            this.answer = ""
            this.tags.removeAll()

        },
        replaceExercise(){
            const exerciseData = this.getExerciseData()
            //TODO allow creation of other types of exercises than QA
            const newExercise = ExerciseQA.create(exerciseData)

            Exercises.get(window.exerciseToReplaceId).then(exercise => {
                exercise.contentItemIds.forEach(contentItemId => {
                    ContentItems.get(contentItemId).then(contentItem => {
                        contentItem.removeExercise(this.exerciseToReplaceId)
                        contentItem.addExercise(newExercise.id)
                    })
                })
            })

            var snack = new Snack({
                domParent: document.querySelector('.new-exercise')
            });
            // show a snack for 4s
            snack.show('Exercise edited!', 4000);

            //TODO: eventually redirect the user back to the tree/exercise they were studying

        }
    },
}
function convertItemIdsObjectToList(obj){
    return Object.keys(obj)
}