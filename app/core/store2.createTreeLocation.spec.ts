import {injectFakeDom} from '../testHelpers/injectFakeDom';
injectFakeDom()
import {
    mockFirebaseReferences, mockTreeLocationsRef, myContainer,
    myContainerLoadAllModulesExceptFirebaseRefs
} from '../../inversify.config';
import {Store} from 'vuex';
import BranchesStore, {MUTATION_NAMES} from './store2';
import {TYPES} from '../objects/types';
import * as sinon from 'sinon'
import {
    ICreateTreeLocationMutationArgs, ITreeDataWithoutId, ITreeLocationData,
    TreeLocationPropertyNames
} from '../objects/interfaces';
import {AppContainer} from './appContainer';
import {expect} from 'chai'
import test from 'ava'
import {createTreeId} from '../objects/tree/TreeUtils';

test('store create location should call correct firebaseRef', t => {
    /** Swap out actual firebase refs with Mock firebase refs.
     *
     */
    myContainer.load(mockFirebaseReferences)
    myContainerLoadAllModulesExceptFirebaseRefs()
    /**
     * Set up data
     */
    const treeId = '123abcde3'
    const x = 5
    const y = 7
    const treeLocationData: ICreateTreeLocationMutationArgs = {
        x,
        y,
        treeId,
    }
    /**
     * Grab the store singleton with which we will create the action
     * @type {Store<any>}
     */
    const store: Store<any> = myContainer.get<BranchesStore>(TYPES.BranchesStore) as Store<any>
    /**
     * Set up spy - spy on the firebase ref.
     * the action on the store should trigger a database update on this firebase ref
     */
    const treeLocationRef = mockTreeLocationsRef.child(treeId)
    const treeLocationRefUpdateSpy = sinon.spy(treeLocationRef, 'update')

    /**
     * Start the app
     */
    const appContainer = myContainer.get<AppContainer>(TYPES.AppContainer)
    appContainer.start()
    /**
     * initialize sigma to avoid refresh on null error
     */
    store.commit(MUTATION_NAMES.INITIALIZE_SIGMA_INSTANCE)
    /**
     * test the actual mutation we are testing
     */
    store.commit(MUTATION_NAMES.CREATE_TREE_LOCATION, treeLocationData )


    expect(treeLocationRefUpdateSpy.callCount).to.deep.equal(1)
    const calledWith = treeLocationRefUpdateSpy.getCall(0).args[0]
    const expectedCalledWith = {
        point: {
            val: {
                x,
                y
            }
        }
    }
    expect(calledWith).to.deep.equal(expectedCalledWith)

    t.pass()

})
