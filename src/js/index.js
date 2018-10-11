class IndexController 
{
    constructor() {
        this.board = null;
        this.base_url = "https://gov.uk";
        this.trelloService = new TrelloService();
        this.stepByStepService = new StepByStepService('apply-standard-visitor-visa', $('.step-by-step--preview'));
        this.performAuthChecks();
        this.initAuthoriseBtnListener();
        this.initGenerateBtnListener();
    }

    initAuthoriseBtnListener() {
        var _this = this;
        var _btn = $('#trello-authorize--button');
        _btn.on('click', function() {
            _this.trelloService.authorize(AuthSuccessCallBack);
            _this.performAuthChecks();
        });
    }

    initGenerateBtnListener() {
        var _this = this;
        var _btn = $('#trello-generate--button');
        _btn.on('click', function(e) {
            var title = _this.stepByStepService.getTitle();
            var steps = _this.stepByStepService.getSteps();
            _this.generateBoard(title).then(function(board){
                _this.board = board;
                steps.forEach(step => {
                    _this.createCardForStep(step);
                });
                _this.displayBoardData(board);
                _btn.text('Trello board generated')
                    .attr('disabled','disabled');
            });
            
        });
    }

    generateBoard(name = null) {
        return this.trelloService.createBoard(name);
    }

    createCardForStep(step) {
        var _this = this;
        this.trelloService
            .getListsForBoard(this.board.id)
            .then(function(lists){
                var list_id = lists[0].id;
                var name = step.title;
                var description = ''; //JSON.stringify(step.contents, null, 2);
                var checklistItems = [];
                step.contents.forEach(content => {
                    switch (content.type) {
                        case "paragraph":
                            description += `${content.text} `;
                            break;
                        case "list":
                            content.contents.forEach(item => {
                                checklistItems.push(`${item.text} - ${_this.base_url}/${item.href}`);
                            });
                            break;
                        default:
                            description += JSON.stringify(content, null, 2);
                            break;
                    }
                });
                _this.trelloService.createCardForList(list_id, name, description)
                .then(function(card){
                    if (checklistItems.length) {
                        _this.trelloService.createChecklistsForCard(card.id, checklistItems);
                    }
                });
            });
    }

    displayBoardData(board) {
        var displayElement = $('.trello-board--data');
        var html = '';
        html += '<h2 class="govuk-heading-l">Board data</h2>';
        html += `<a href="${board.url}" target="_blank">${board.url}<a>`;
        return displayElement.html(html);
    }

    performAuthChecks() {
        if ( this.trelloService.isAuthorized() ) {
            $('#trello-authorize--button')
                .text('Authenticated')
                .attr('disabled','disabled');

            $('#trello-generate--button')
                .show();
        }
    }
}

/* 
 * Global callbacks
 */
var AuthSuccessCallBack = function() {
    _indexController.performAuthChecks();
}