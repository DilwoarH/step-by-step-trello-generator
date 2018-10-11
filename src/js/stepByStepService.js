class StepByStepService 
{
    constructor(path, domElement = null) {
        this.path = path;
        this.domElement = domElement;
        this.api_path = 'https://www.gov.uk/api/content';
        this.step_nav = null;
        this.initStepByStepNav();
    }

    apiUrl() {
        return `${this.api_path}/${this.path}`;
    }

    content() {
        return $.getJSON(this.apiUrl())
    }

    initStepByStepNav() {
        var content = this.content();
        var _this = this;
        content.then(function(data){
            _this.step_nav = data.details.step_by_step_nav;
            if (_this.domElement)
            {
                _this.displayStepByStep();
            }
        });
    }

    getStepByStepNav() {
        return this.step_nav;
    }

    getTitle() {
        return this.step_nav.title;
    }

    getSteps() {
        return this.step_nav.steps;
    }

    buildHTML() {
        var html = '';

        html += `<h2 class="govuk-heading-l">${this.step_nav.title}</h2>`;
        html += `<p class="govuk-body govuk-!-font-weight-bold">${this.step_nav.introduction.replace('<p>','').replace('</p>','')}</p>`;
        html += '<ol class="govuk-list govuk-list--number">';
        this.step_nav.steps.forEach(step => {
            html += `<li>${step.title}</li>`;
        });
        html += '</ol>';

        return html;
    }

    displayStepByStep() {
        var html = this.buildHTML();
        var elm = this.domElement;
        elm.html(html);
    }

}