/* tslint:disable max-classes-per-file */
/* tslint:disable variable-name */
// import {log} from '../../core/log'
import {inject, injectable} from 'inversify';
import {ISubscribable, updatesCallback} from '../ISubscribable';
import {IMutable, IUndoableMutable} from '../mutations/IMutable';
import {IActivatableDatedMutation, IDatedMutation} from '../mutations/IMutation';
import {Subscribable} from '../tree/Subscribable';
import {TYPES} from '../types';
import {ISet} from './ISet';
import {SetMutationTypes} from './SetMutationTypes';

/*
Decided to not implement IUndoable on this class, because undo/redo add/remove aren't
 as commutative as they seem . . . at least for the complicated specs I was setting for myself . . .
 See the commit history for the commit before this file was created to see what I mean.
 */
@injectable()
class SubscribableMutableStringSet extends Subscribable<SetMutationTypes>
    implements IMutable<IDatedMutation<SetMutationTypes>>, ISet<string> {

    /* TODO: maybe this and the above should be inherited protected properties from a base class */
    private _mutations: Array<IDatedMutation<SetMutationTypes>>;
    private set: object;
    constructor(@inject(TYPES.SubscribableMutableStringSetArgs)
        {set = {}, mutations = [], updatesCallbacks = []} = {set: [], mutations: [], updatesCallbacks: []} ) {
        super({updatesCallbacks})
        this.set = set
        this._mutations = mutations
    }

    public getMembers(): string[] {
        return Object.keys(this.set)
    }

    private add(member: string) {
        if (this.set[member]) {
            throw new RangeError(
                member + ' is already a member. The members are' + JSON.stringify(this.getMembers())
            )
        }
        this.set[member] = true
        this.updates.val = {}
        this.updates.val[member] = true
        // TODO: Fix Violation of Law of Demeter ^^
    }

    private remove(member: string) {
        if (!this.set[member]) {
            throw new RangeError(member + ' is not a member. The members are' + JSON.stringify(this.getMembers()))
        }
        delete this.set[member]
        this.updates.val = {}
        this.updates.val[member] = false
        // TODO: Fix Violation of Law of Demeter ^^
    }
    public hasMember(member: string): boolean {
        return this.set[member]
    }
    public addMutation(mutation: IDatedMutation<SetMutationTypes>) {
        switch (mutation.type) {
            case SetMutationTypes.ADD:
                this.add(mutation.data)
                break;
            case SetMutationTypes.REMOVE:
                this.remove(mutation.data)
                break;
            default:
                throw new TypeError('Mutation Type needs to be one of the following types'
                    + JSON.stringify(SetMutationTypes))
        }
        this._mutations.push(mutation)
        this.pushes = {mutations: mutation}
        this.callCallbacks()
    }

    public mutations(): Array<IDatedMutation<SetMutationTypes>> {
        return this._mutations;
    }

}
@injectable()
class SubscribableMutableStringSetArgs {
    @inject(TYPES.Object) public set;
    @inject(TYPES.Array) public mutations;
    @inject(TYPES.Array) public updatesCallbacks;
}

export {SubscribableMutableStringSet,  SubscribableMutableStringSetArgs}