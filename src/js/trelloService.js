class TrelloService 
{
    constructor() {
        this.trello = window.Trello;
    }

    authorize(success_callback = null, error_callback = null) {
        return this.trello.authorize({
            type: 'popup',
            name: 'GOV.UK Step by Step Trello App',
            scope: {
                read: 'true',
                write: 'true'
            },
            expiration: 'never',
            success: success_callback ? success_callback : this.authenticationSuccess,
            error: error_callback ? error_callback : this.authenticationFailure
        });
    }

    authenticationSuccess() {
        console.log('Successful authentication');
    }

    authenticationFailure() {
        console.log('Failed authentication');
    }

    isAuthorized() {
        return window.Trello.authorized();
    }

    /* 
     * Create Board
     * Return Promise
     */
    createBoard( name = null ) {
        if (!name) return { "error": "No name given." };
        return this.trello.post(`/boards/?name=${name}`);
    }

    /* 
     * Get Board
     * Return Promise
     */
    getBoard( id = null ) {
        if (!name) return { "error": "No id given." };
        return Trello.boards.get(id);
    }

    /* 
     * Get Lists for Board
     * Return Promise
     */
    getListsForBoard( id = null ) {
        if (!id) return { "error": "No id given." };
        return Trello.boards.get(`${id}/lists`);
    }

    /* 
     * Create Card for list
     * Return Promise
     */
    createCardForList( list_id = null, name = null, description = null ) {
        if (!list_id || !name) return { "error": "Invalid data." };
        return this.trello.post(`/cards/?idList=${list_id}&name=${name}&desc=${description}`);
    }

    createChecklistsForCard( card_id, items )
    {
        if (!card_id || !items) return { "error": "Invalid data." };
        var name = "Actions / Useful content";
        var _this = this;
        this.trello.post(`/checklists/?idCard=${card_id}&name=${name}`)
        .then(function(checklist){
            items.forEach(item => {
                _this.trello.post(`/checklists/${checklist.id}/checkItems?name=${item}`);
            });
        });
    }
}
