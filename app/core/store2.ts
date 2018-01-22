import {Store} from 'vuex'
import * as Vuex from 'vuex'
import {GRAPH_CONTAINER_ID, ROOT_ID} from './globals';
import {log} from './log'
import sigma from '../../other_imports/sigma/sigma.core.js'
import {
    ContentUserPropertyNames, FieldMutationTypes, ITypeIdProppedDatedMutation, IIdProppedDatedMutation,
    ISigmaEventListener, ITooltipOpener, ITooltipRenderer, IVuexStore,
    ObjectTypes, TreePropertyNames, ICreateMutation, STORE_MUTATION_TYPES, IContentUserData, CONTENT_TYPES,
    IContentDataEither, IContentData
} from '../objects/interfaces';
import {SigmaEventListener} from '../objects/sigmaEventListener/sigmaEventListener';
import {TooltipOpener} from '../objects/tooltipOpener/tooltipOpener';
import {TYPES} from '../objects/types';
import {inject, injectable} from 'inversify';
import {TooltipRenderer} from '../objects/tooltipOpener/tooltipRenderer';
import {ContentUserData} from '../objects/contentUser/ContentUserData';

let Vue = require('vue').default // for webpack
if (!Vue) {
    Vue = require('vue') // for ava-ts tests
}
// import Vue from 'vue';
// if (!Vue) {
//     import * as Vue from 'vue'
// }
const sigmaAny: any = sigma
Vue.use(Vuex)

export enum MUTATION_NAMES {
    INITIALIZE_SIGMA_INSTANCE = 'initializeSigmaInstance',
    JUMP_TO = 'jump_to',
    REFRESH = 'refresh',
    ADD_NODE = 'add_node',
    CREATE_CONTENT_USER_DATA = 'create_content_user_data',
    CREATE_CONTENT = 'create_content',
    ADD_CONTENT_INTERACTION = 'add_content_interaction',
    ADD_CONTENT_INTERACTION_IF_NO_CONTENT_USER_DATA = 'ADD_CONTENT_INTERACTION_IF_NO_CONTENT_USER_DATA',
    ADD_FIRST_CONTENT_INTERACTION = 'add_first_content_interaction',
    CHANGE_USER_ID = 'changeUserId',
}

const getters = {
    getStore() {} // Will redefine later
}
const mutations = {
    initializeSigmaInstance() {

    },
    [MUTATION_NAMES.JUMP_TO](state, treeId) {
        state.jumpToId = treeId
    },
    [MUTATION_NAMES.INITIALIZE_SIGMA_INSTANCE](state) {
        const sigmaInstance /*: Sigma*/ = new sigma({
            graph: state.graphData,
            container: GRAPH_CONTAINER_ID,
            glyphScale: 0.7,
            glyphFillColor: '#666',
            glyphTextColor: 'white',
            glyphStrokeColor: 'transparent',
            glyphFont: 'FontAwesome',
            glyphFontStyle: 'normal',
            glyphTextThreshold: 6,
            glyphThreshold: 3,
        } as any/* as SigmaConfigs*/) as any
        // log('sigma truly just initialized')
        state.sigmaInstance = sigmaInstance
        state.graph = sigmaInstance.graph
        state.sigmaInitialized = true
        if (typeof window !== 'undefined') { // for debuggin only. NOT to be used by other classes
            const windowAny: any = window
            windowAny.sigmaInstance = sigmaInstance
        }

        sigmaInstance.cameras[0].goTo({x: 5, y: 5, ratio: .05})

        /* TODO: it would be nice if I didn't have to do all this constructing
         inside of store2.ts and rather did it inside of appContainer or inversify.config.ts */
        const store = getters.getStore()
        const tooltipRenderer: ITooltipRenderer = new TooltipRenderer({store})
        const tooltipsConfig = tooltipRenderer.getTooltipsConfig()
        const tooltips = sigmaAny.plugins.tooltips(sigmaInstance, sigmaInstance.renderers[0], tooltipsConfig)
        const tooltipOpener: ITooltipOpener =
            new TooltipOpener(
                {
                    tooltips,
                    store,
                    tooltipsConfig,
                })
        const sigmaEventListener: ISigmaEventListener = new SigmaEventListener({tooltipOpener, sigmaInstance})
        sigmaEventListener.startListening()
    },
    [MUTATION_NAMES.REFRESH](state) {
        log('store mutation refresh called', state)
        state.sigmaInstance.refresh()
    },
// TODO: if contentUser does not yet exist in the DB create it.
    [MUTATION_NAMES.ADD_CONTENT_INTERACTION](state, {contentUserId, proficiency, timestamp}) {
        const id = contentUserId
        const objectType = ObjectTypes.CONTENT_USER
        const propertyName = ContentUserPropertyNames.PROFICIENCY;
        const type = FieldMutationTypes.SET;
        const data = proficiency

        const storeMutation: IIdProppedDatedMutation<FieldMutationTypes, ContentUserPropertyNames> = {
            data, id, propertyName, timestamp, type
        }

        const globalMutation: ITypeIdProppedDatedMutation<FieldMutationTypes> = {
            objectType,
            ...storeMutation
        }
        state.globalDataStore.addMutation(globalMutation)
        mutations[MUTATION_NAMES.REFRESH](state, null)
    },
    [MUTATION_NAMES.ADD_CONTENT_INTERACTION_IF_NO_CONTENT_USER_DATA](state, {contentUserId, proficiency, timestamp}) {
        const contentUserData: IContentUserData = {
            id: contentUserId,
            timer: 0, // TODO: add timer to app
            lastRecordedStrength: null, // TODO: Add calculate strength to app,
            overdue: false, // TODO: add overdue functionality
            proficiency,
        }
        mutations[MUTATION_NAMES.CREATE_CONTENT_USER_DATA](state, {contentUserId, contentUserData})
        mutations[MUTATION_NAMES.ADD_CONTENT_INTERACTION](state, {contentUserId, proficiency, timestamp})
        return contentUserData
    },
    [MUTATION_NAMES.CREATE_CONTENT_USER_DATA](state, {contentUserId, contentUserData}) {
        const createMutation: ICreateMutation<ContentUserData> = {
            id: contentUserId,
            data: contentUserData,
            objectType: ObjectTypes.CONTENT_USER,
            type: STORE_MUTATION_TYPES.CREATE_ITEM,
        }
        state.globalDataStore.addMutation(createMutation)
        // const contentUserData: IContentUserData = state.globalDataStore.addMutation(createMutation)
    //
    },
    [MUTATION_NAMES.CREATE_CONTENT](state, {
        type, question, answer, title
    }: IContentDataEither) {
        const createMutation: ICreateMutation<IContentData> = {
            type: STORE_MUTATION_TYPES.CREATE_ITEM,
            objectType: ObjectTypes.CONTENT,
            data: {type, question, answer, title},
        }
        state.globalDataStore.addMutation(createMutation)
    },
    [MUTATION_NAMES.CHANGE_USER_ID](state, userId) {
        state.userId = userId
    },
}
mutations[MUTATION_NAMES.ADD_NODE] = (state, node) => {
    if (state.sigmaInitialized) {
        log('sigma was already initialized . .. adding node', node)
        state.graph.addNode(node)
        mutations[MUTATION_NAMES.REFRESH](state, null) // TODO: WHY IS THIS LINE EXPECTING A SECOND ARGUMENT?
        log('STORE 2 TS ADD NODE. THIS STORE is ', getters.getStore())
    } else {
        state.graphData.nodes.push(node)
    }
}
const actions = {}

@injectable()
export default class BranchesStore {
    constructor(@inject(TYPES.BranchesStoreArgs){globalDataStore, state}) {
        const store = new Store({
            state,
            mutations,
            actions,
            getters,
        } ) as Store<any>
        getters.getStore = () => store
        store['globalDataStore'] = globalDataStore // added just to pass injectionWorks test
        state.globalDataStore = globalDataStore /* added because this is actually
        the mechanism we will use to access globalDataStore */
        return store
    }
}
@injectable()
export class BranchesStoreArgs {
    @inject(TYPES.IMutableSubscribableGlobalStore) public globalDataStore
    @inject(TYPES.BranchesStoreState) public state
}
