document.querySelector("form").addEventListener("submit", function(e) {
  document.body.style.setProperty('--loader', 'block');
  e.preventDefault()
  var remove = document.getElementById("images");
  while (remove.firstChild) {
    remove.removeChild(remove.firstChild);
  }
  zoekOpdracht = document.querySelector("input").value

  console.log(zoekOpdracht);

  var sparqlquery = `
  		PREFIX dc: <http://purl.org/dc/elements/1.1/>
      PREFIX dct: <http://purl.org/dc/terms/>
  		PREFIX foaf: <http://xmlns.com/foaf/0.1/>
      PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>

  		SELECT ?cho ?title ?img ?endDate ?creator ?provenance ?description WHERE {
  		 ?cho dc:type ?type .
    		  ?cho dc:title ?title .
          ?cho dc:creator ?creator .
          ?cho dct:provenance ?provenance .
          ?cho dc:description ?description .
  		  ?cho foaf:depiction ?img .
        ?cho sem:hasEndTimeStamp ?endDate .

        FILTER REGEX(?title, '${zoekOpdracht}', 'i')
  		}`;

  // more fun dc:types: 'affiche', 'japonstof', 'tegel', 'herenkostuum'
  // more fun dc:subjects with Poster.: 'Privacy.', 'Pop music.', 'Music.', 'Squatters movement.'

  var encodedquery = encodeURI(sparqlquery);

  var queryurl = 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodedquery + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';

  fetch(queryurl)
    .then((resp) => resp.json()) // transform the data into json
    .then(function(data) {
      document.body.style.setProperty('--loader', 'none');

      rows = data.results.bindings; // get the results
      if (rows.length == 0) {
        error.style.display = 'block'
      } else {
        error.style.display = 'none'
      }
      imgdiv = document.getElementById('images');
      console.log(rows);
      console.log(data);

      for (i = 0; i < rows.length; ++i) {

        var img = document.createElement('img');
        img.date = rows[i]['endDate']['value'];
        img.provenance = rows[i]['provenance']['value'];
        img.description = rows[i]['description']['value'];
        img.creator = rows[i]['creator']['value'];
        img.link = rows[i]['cho']['value'];
        img.src = rows[i]['img']['value'];
        img.title = rows[i]['title']['value'];
        imgdiv.appendChild(img);
      }

      let allImages = document.querySelectorAll("#images img");
      let loadCount = 0;

      allImages.forEach(function(el) {
        el.addEventListener("load", function() {
          loadCount += 1;
          if (loadCount === Object.keys(allImages).length) {
            imagesSet();
          } else if ((loadCount / 5) % 1 === 0) {
            imagesSet();
          }
        })
      })

      function imagesSet() {
        let imagesOfset = [];
        let imageRowChange = [];
        allImages.forEach(function(el) {
          imagesOfset.push(el.offsetTop);
        })

        for (let i = 0; i < imagesOfset.length; i++) {
          if (imagesOfset[i] != imagesOfset[i + 1]) {
            imageRowChange.push(i);
          }
        }

        for (let i = 0; i < allImages.length; i++) {
          let tempPos = i;

          allImages[i].addEventListener("click", function _func() {
            if (document.querySelector(".info")) {
              document.querySelector(".info").remove();
            }
            let imageRowChangeFiltert = imageRowChange.filter(function(el) {
              return (el >= tempPos);
            });

            console.log(imageRowChangeFiltert);
            console.log(allImages[imageRowChangeFiltert[0] + 1]);

            let newNode = document.createElement("div");
            newNode.classList.add("info");

            let closeBox = document.createElement("div");
            closeBox.classList.add("close");

            let infoImg = document.createElement("img");
            infoImg.classList.add("bigimg");

            let textBox = document.createElement("section");
            textBox.classList.add("text");

            let infoParagraph = document.createElement("h1");

            let infoLink = document.createElement("a");

            let infoCreator = document.createElement("p");
            infoCreator.classList.add("creator");

            let infoDescription = document.createElement("p");

            let infoProvenance = document.createElement("p");
            infoProvenance.classList.add("provenance");

            let infoDate = document.createElement("p");
            infoDate.classList.add("date");

            infoImg.src = this.src;
            infoParagraph.title = this.title;
            infoLink.link = this.link;
            infoCreator.creator = this.creator;
            infoDescription.description = this.description;
            infoProvenance.provenance = this.provenance;
            infoDate.date = this.date;

            let infoText = document.createTextNode(this.title);
            let infoLinkText = document.createTextNode('Klik hier om naar de bronpagina te gaan');
            let infoCreatorText = document.createTextNode('Eigenaar: ' + this.creator);
            let infoDescriptionText = document.createTextNode(this.description);
            let infoProvenanceText = document.createTextNode('Archief: ' + this.provenance);
            let infoDateText = document.createTextNode('Datum: ' + this.date);

            infoDescription.appendChild(infoDescriptionText);
            infoParagraph.appendChild(infoText);
            infoLink.appendChild(infoLinkText);
            infoCreator.appendChild(infoCreatorText);
            infoProvenance.appendChild(infoProvenanceText);
            infoDate.appendChild(infoDateText);

            newNode.appendChild(closeBox);
            newNode.appendChild(textBox);
              textBox.appendChild(infoParagraph);
              textBox.appendChild(infoDescription);
              textBox.appendChild(infoCreator);
              textBox.appendChild(infoDate);
              textBox.appendChild(infoProvenance);
              textBox.appendChild(infoLink);
            newNode.appendChild(infoImg);

            document.querySelector("#images").insertBefore(newNode, allImages[imageRowChangeFiltert[0] + 1])
            document.querySelector(".close").addEventListener("click", function() {
              this.parentElement.remove();
            })
          })
        }
      }

    })
    .catch(function(error) {
      // if there is any error you will catch them here
      console.log(error);
    });

})
