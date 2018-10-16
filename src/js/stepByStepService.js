class StepByStepService 
{
    constructor(url, domElement = null) {
        this.url = url;
        this.path = url.pathname;
        this.domElement = domElement;
        this.api_path = 'https://www.gov.uk/api/content';
        this.step_nav = null;
        this.activeStepByStepId = this.activeStepByStepId();
        this.initStepByStepNav(this.activeStepByStepId);
    }

    activeStepByStepId() {
        return this.url.searchParams.get('step-by-step-nav')
    }

    apiUrl() {
        return `${this.api_path}${this.path}`;
    }

    content() {
        return $.getJSON(this.apiUrl())
    }

    initStepByStepNav(activeStepByStepId = false) {
        var content = this.content();
        var _this = this;
        content.then(function(data) {
            _this.step_nav = data.details.step_by_step_nav;

            if (!_this.step_nav && data.links.part_of_step_navs && data.links.part_of_step_navs.length == 1) 
            {
                _this.step_nav = data.links.part_of_step_navs[0].details.step_by_step_nav;
            }
            else if (activeStepByStepId)
            {
                if (!_this.step_nav && data.links.part_of_step_navs)
                {
                    data.links.part_of_step_navs.forEach(step_nav => {
                        if ( activeStepByStepId == step_nav.content_id ) {
                            _this.step_nav = step_nav.details.step_by_step_nav;
                            return false;
                        }
                    });
                }

                if (!_this.step_nav && data.links.related_to_step_navs) 
                {
                    data.links.related_to_step_navs.forEach(step_nav => {
                        if ( activeStepByStepId == step_nav.content_id ) {
                            _this.step_nav = step_nav.details.step_by_step_nav;
                            return false;
                        }
                    });
                }
            }

            if (_this.step_nav && _this.domElement)
            {
                _this.displayStepByStep();
            } 
            else 
            {
                _this.displayStepByStepNotFound();
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

    getIntroduction() {
        if (typeof this.step_nav.introduction == 'string') return this.step_nav.introduction;
        else if (typeof this.step_nav.introduction == 'object') return this.step_nav.introduction[0].content;
    }

    buildHTML() {
        var html = '';

        html += `<h2 class="govuk-heading-l">${this.step_nav.title}</h2>`;
        html += `<p class="govuk-body govuk-!-font-weight-bold">${this.getIntroduction().replace('<p>','').replace('</p>','')}</p>`;
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

    displayStepByStepNotFound() {
        var html = `
            <div class="govuk-warning-text">
                <span class="govuk-warning-text__icon" aria-hidden="true">!</span>
                <strong class="govuk-warning-text__text">
                <span class="govuk-warning-text__assistive">Warning</span>
                    No matching step by steps found
                </strong>
            </div>
        `;
        var elm = this.domElement;
        elm.html(html);
    }

}