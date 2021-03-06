import {injectFakeDom} from '../../../testHelpers/injectFakeDom';
injectFakeDom()
import test from 'ava'
import {expect} from 'chai'
import * as sinon from 'sinon'
import {myContainer, myContainerLoadAllModules} from '../../../../inversify.config';
import {CONTENT_ID2} from '../../../testHelpers/testHelpers';
import {MutableSubscribableContentUser} from '../../contentUser/MutableSubscribableContentUser';
import {MutableSubscribableField} from '../../field/MutableSubscribableField';
import {
    ContentUserPropertyNames, FieldMutationTypes, IProppedDatedMutation,
    ISubscribableContentUserStore, ISubscribableMutableField, timestamp
} from '../../interfaces';
import {PROFICIENCIES} from '../../proficiency/proficiencyEnum';
import {TYPES} from '../../types';
import {getContentUserId} from '../../../loaders/contentUser/ContentUserLoaderUtils';

myContainerLoadAllModules()
test('SubscribableContentUserStore > addItem:::' +
    'An update in a member content should be published to a subscriber of the content data stores', (t) => {
    /* TODO: Note this is more of an integration test than a true unit test.
    It might be that some of these modules are designed poorly, being the reason
     why I couldn't find an easy way to do a pure unit test.
     e.g. rather than just triggering an update directly on content,
     I had to do it indirectly by adding a mutation
     */
    const contentId = CONTENT_ID2
    const userId = 'abc123'
    const contentUserId = getContentUserId({contentId, userId})
    const overdue = new MutableSubscribableField<boolean>({field: false})
    const nextReviewTimeVal = Date.now() + 1000 * 60
    const lastInteractionTimeVal = Date.now()
    const lastRecordedStrength = new MutableSubscribableField<number>({field: 45})
    const proficiency = new MutableSubscribableField<PROFICIENCIES>({field: PROFICIENCIES.TWO})
    const timer = new MutableSubscribableField<number>({field: 30})
    const lastInteractionTime: ISubscribableMutableField<timestamp> = new MutableSubscribableField<timestamp>({field: lastInteractionTimeVal})
    const nextReviewTime: ISubscribableMutableField<timestamp> = new MutableSubscribableField<timestamp>({field: nextReviewTimeVal})
    const contentUser = new MutableSubscribableContentUser({
        id: contentUserId, lastRecordedStrength, overdue, proficiency, timer, lastInteractionTime, nextReviewTime, updatesCallbacks: [],
    })
    const contentUserStore: ISubscribableContentUserStore
        = myContainer.get<ISubscribableContentUserStore>(TYPES.ISubscribableContentUserStore)
    // const contentUserStore = myContainer.get<ISubscribableContentUserStore>(TYPES.ISubscribableContentUserStore)
    const callback1 = sinon.spy()
    const callback2 = sinon.spy()

    contentUserStore.onUpdate(callback1)
    contentUserStore.onUpdate(callback2)
    contentUserStore.startPublishing()
    /* TODO: add test to put subscribeToAllItems() before the onUpdates to show it works irrespective of order
     */
    contentUserStore.addItem(contentUserId, contentUser)

    const sampleMutation: IProppedDatedMutation<FieldMutationTypes, ContentUserPropertyNames> = {
        data: PROFICIENCIES.TWO,
        propertyName: ContentUserPropertyNames.PROFICIENCY,
        timestamp: Date.now(),
        type: FieldMutationTypes.SET,
    }

    contentUser.addMutation(sampleMutation)

    const contentUserNewVal = contentUser.val()
    // expect(callback1.callCount).to.equal(1)
    // expect(callback1.getCall(0).args[0].id).to.equal(contentId)
    // expect(callback1.getCall(0).args[0].val).to.deep.equal(contentUserNewVal)
    // expect(callback2.callCount).to.equal(1)
    expect(callback2.getCall(0).args[0].id).to.equal(contentUserId)
    expect(callback2.getCall(0).args[0].val).to.deep.equal(contentUserNewVal)
    t.pass()
})
