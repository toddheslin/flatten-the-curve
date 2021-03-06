import React from 'react'
const Footer = () => (
    <section className="section  has-background-dark has-text-white footer" style={{marginTop: '20px', paddingTop: '20px',  paddingBottom: '20px', clear: 'both'}}>
        <div className="container">
          <div className="columns">
            <div className="column">
              <p className="is-size-5">
                Data Sources
              </p>
              <p className="is-size-7">
                Global COVID-19 data is sourced from the 
                {' '}<a href="https://github.com/CSSEGISandData/COVID-19" target="_blank" rel="noopener noreferrer">
                  Johns Hopkins University Center for Systems Science and Engineering
                </a>.
              </p>
              <p className="is-size-7">
                United States total and state level COVID-19 data is sourced from the
                {' '}<a href="https://covidtracking.com/" target="_blank" rel="noopener noreferrer">
                  COVID Tracking Project
                </a>.
              </p>
              <p className="is-size-7">
                New Zealand data is sourced from  
                {' '}<a href="https://www.health.govt.nz/our-work/diseases-and-conditions/covid-19-novel-coronavirus" target="_blank" rel="noopener noreferrer">
                  Ministry of Health 
                </a> annoucements.
              </p> 
              <p className="is-size-7">
                Population data sourced from <a href="https://data.worldbank.org/indicator/SP.POP.TOTL" target="_blank" rel="noopener noreferrer">The World Bank</a>
                </p>
              <p className="is-size-7" style={{marginTop: '10px'}}>
                Currently in development by <a href="https://carlaiau.com/">Carl Aiau</a>.
                Code available at  <a href="https://github.com/carlaiau/flatten-the-curve" target="_blank" rel="noopener noreferrer">Github</a>. Please Don't hesitate to contribute to the repo or give me any feedback.
              </p>
              
            </div>
            <div className="column">
              <p className="is-size-5">Terms of Use</p>
              <p className="is-size-7">All COVID-19 data belongs to Johns Hopkins University.
                It is provided to the public strictly for educational and academic research purposes. 
                The Website relies upon publicly available data from multiple sources, that do not always agree. 
              </p>
              <p className="is-size-7">
                Carl Aiau hereby disclaims any and all representations and warranties with respect to the data and website, including accuracy, 
                fitness for use, and merchantability. </p>
              <p className="is-size-7">Reliance on the Website for medical guidance or use of the Website in commerce is strictly prohibited.</p>
            </div>
          </div>
            
        </div>
    </section>
  )

export default Footer