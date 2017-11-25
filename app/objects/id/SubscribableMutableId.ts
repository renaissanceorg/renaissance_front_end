// tslint:disable max-classes-per-file
import {inject, injectable} from 'inversify';
import {decorate} from 'inversify'
import {ISubscribable, updatesCallback} from '../ISubscribable';
import {Mixin} from '../Mixin';
import {IDatedMutation} from '../mutations/IMutation';
import {Subscribable} from '../tree/Subscribable';
import {TYPES} from '../types';
import {IdMutationTypes} from './IdMutationTypes';
import {ISubscribableMutableId} from './ISubscribableMutableId';
import {IMutableId, MutableId} from './MutableId';
decorate(injectable(), Array)

@Mixin(Subscribable, MutableId)
@injectable()
class SubscribableMutableId implements ISubscribableMutableId {
    public onUpdate(func: updatesCallback) {return null}
    public get(): string { return null  }
    public addMutation(mutation: IDatedMutation<IdMutationTypes>): void { return null}
    public mutations(): Array<IDatedMutation<IdMutationTypes>> { return null}
    constructor(@inject(TYPES.ISubscribableMutableIdArgs) {updatesCallbacks = [], id, mutations = []}) {
        const subscribable = new Subscribable({updatesCallbacks})
        Object.getOwnPropertyNames(subscribable).forEach(prop => {
            this[prop] = subscribable[prop]
        })
        const mutableId = new MutableId({id, mutations})
        Object.getOwnPropertyNames(mutableId).forEach(prop => {
            this[prop] = mutableId[prop]
        })

    }
}
interface ISubscribableMutableIdArgs {
    updatesCallbacks;
    id;
    mutations;
}
@injectable()
class SubscribableMutableIdArgs implements ISubscribableMutableIdArgs {
    @inject(TYPES.Array) public updatesCallbacks = []
    @inject(TYPES.String) public id = null
    @inject(TYPES.Array) public mutations = []
}
export {SubscribableMutableId, SubscribableMutableIdArgs, ISubscribableMutableIdArgs}