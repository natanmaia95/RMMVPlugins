//=============================================================================
// Maia_EnemyIntentDisplay.js
//=============================================================================

/*:
@plugindesc v1.0 Indicate what actions the enemies will do next, like in Slay the Spire.
@author Natan Maia

@help 

~~ How the plugin works ~~

By default, enemies make their choices before the player can input.
When those choices are made, this plugin applies states to those enemies
that match the kinds of actions they chose.

They aren't exclusive states for each action, but categories.
Also, auto-battle allies also get these states.



~~ How to set it up ~~

1. Make a few states with icons related to your intents, like
"Will use Attack" or "Will use a spell" or "Will use a healing ability".
Treat them as categories of actions.

2. Include <Intent:X> in the notetag for any Skills or Items
you want intents displayed, with X the id of the desired state.



~~ FAQ ~~

> Can the default Attack and Guard have intents?
Yes! Just add <Intent:X> in their skill database entries.

> What if I want a different intent icon for every action?
Make a unique state for every action. Sorry. 

> What if a skill doesn't have an Intent?
Then it simply shows no state. You could make an "unknown" intent too.



~~ Changelog ~~

Version 1.0
> Initial release.
*/

var Maia = Maia || {}; //var instead of let because we want to inherit exisiting Maia dicts
Maia.EnemyIntentDisplay = {};
Maia.EnemyIntentDisplay.alias = {};

/* 
This is where all actions are decided, for both enemies and auto-battling actors.
They make their choices in each Game_Unit's 'makeActions()'.
So, as long as the party is allowed to make decisions (so, they aren't surprised),
AI choices will be made here, then the player can make their own choices.

BattleManager.startInput = function() {
    this._phase = 'input';
    $gameParty.makeActions();
    $gameTroop.makeActions();
    this.clearActor();
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
};
*/

// Maia.EnemyIntentDisplay.alias.BM_startInput = BattleManager.startInput;
// BattleManager.startInput = function() {
//     Maia.EnemyIntentDisplay.alias.BM_startInput.call(this);
//     // display enemy intents as states?
//     // Nop. moved to each battler's own makeActions step.
// };



Maia.EnemyIntentDisplay.alias.Game_Actor_makeActions = Game_Actor.prototype.makeActions;
Game_Actor.prototype.makeActions = function() {
    Maia.EnemyIntentDisplay.alias.Game_Actor_makeActions.call(this);
    this._result.clear(); // fix a bug where GameAction_Result is inconsistent if damage popups are still active during this call
    this.addIntentStates();
}
Maia.EnemyIntentDisplay.alias.Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
Game_Enemy.prototype.makeActions = function() {
    Maia.EnemyIntentDisplay.alias.Game_Enemy_makeActions.call(this);
    this._result.clear(); // fix a bug where GameAction_Result is inconsistent if damage popups are still active during this call
    this.addIntentStates();
}

Game_Battler.prototype.addIntentStates = function() {
    let battler = this;
    console.log(battler.name());
    this._actions.forEach(function(action) {
        if (!action._item) return;
        console.log("a");
        /** @type {Game_Item} */
        let gameItem = action._item;
        if (gameItem.isNull()) return;
        console.log("b");

        let database = [];
        if (gameItem.isSkill()) database = $dataSkills;
        else if (gameItem.isItem()) database = $dataItems;
        if (database.length == 0) return; //we dont support other action types.
        console.log("c");

        /** @type {Game_Item} */
        let dataItem = database[gameItem._itemId];
        let intentStateId = parseInt(dataItem.meta["Intent"]);
        if (!intentStateId) return;
        console.log("d", intentStateId, battler._states);

        battler.addState(intentStateId);
        console.log("e", battler._states);
    });
};

// Game_Battler.prototype.removeStatesAuto = function(timing) {
//     this.states().forEach(function(state) {
//         if (this.isStateExpired(state.id) && state.autoRemovalTiming === timing) {
//             this.removeState(state.id);
//             console.log('removed state ', state.id, ' from ', this.name(), ' now the remaining states are: ', this._states, this._stateTurns)
//         }
//     }, this);
// };