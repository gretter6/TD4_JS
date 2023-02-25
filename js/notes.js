'use strict'

class Note {

    constructor(titre, contenu) 
    {
        this.titre = titre;
        this.contenu = contenu;
        this.date_creation = new Date().toLocaleDateString();
    }

    setTitre(t) 
    {
        this.titre = t;
    }

    setContenu(c) 
    {
        this.contenu = c;
    }

}

class NoteView {

    constructor (note)
    {
        this.note = note;
    }

    convertir(note)
    {
        let conv = new showdown.Converter();
        return conv.makeHtml(note);
        
    }

    afficher()
    {
        document.querySelector("#currentNoteView").classList.remove("current_note-hidden");
        let htmlText = this.convertir(this.note.contenu);
        let htmlTitre = this.note.titre;
        let htmlDate = this.note.date_creation;
        document.querySelector('#currentNoteView').innerHTML = `
        <h1>${htmlTitre}</h1>
        <p>${htmlDate}</p>
        <p>${htmlText}</p>`;

    }

}

class NoteList {

    constructor() 
    {
        this.tabN = [];
        if (!localStorage.getItem("tabN")){
            this.save();
        }
        this.load();
    }

    addNote(note)
    {
        this.tabN.push(note);
        this.save();
        return this.tabN.length-1;
        
    }

    suppNote()
    {
        this.tabN.splice(etatGlobal.indexNoteCourante,1);
        this.save();
    }

    modifNote(indice,valeur)
    {
        this.tabN.splice(indice,valeur);
        this.save();
    }

    getNoteById(i)
    {
        return this.tabN[i];
    }

    getList()
    {
        return this.tabN;
    }

    save()
    {
        let jsonString = JSON.stringify( this.tabN ) ;
        localStorage.setItem( 'tabN', jsonString );
    }

    load()
    {
        this.tabN = JSON.parse( localStorage.getItem('tabN') ) ;
        console.log(this.tabN);
    }

    clear()
    {
        let list = document.querySelector('#noteListMenu');
        console.log(etatGlobal.listeNotes.getList());
        for (let i = 0; i < list.children.length;) {
            let a = list.children[i];
            list.removeChild(a);

        }
        etatGlobal.listeNotes.getList().splice(0);
        console.log(etatGlobal.listeNotes.getList());
        etatGlobal.listeNotes.save();

        noteFormView.hide();
        document.querySelector("#currentNoteView").classList.add("current_note-hidden");
        etatGlobal.noteCourante=undefined;
    }

}

let noteFormView = {
    init()
    {
        document.querySelector("#form_add_note_valid").onclick = noteFormView.validate;
    },
    display() {
        
        document.querySelector("#currentNoteView").classList.add("current_note-hidden");

        let edit = document.querySelector("#noteForm");

        document.querySelector("#form_add_note_title").value = "";
        edit.children[0].setAttribute("placeholder","titre");
        edit.children[1].value = "contenu de la note";
        document.querySelector("#noteForm").classList.remove("create_edit_note-hidden");
        noteFormView.init();

    },
    hide() {

        document.querySelector("#noteForm").classList.add("create_edit_note-hidden");
        

    },
    validate() {
        
        let titre = document.querySelector("#form_add_note_title").value;
        let text = document.querySelector("#form_add_note_text").value;

        let note = new Note(titre,text);

        //ajout dans la liste dans l'état global de la note
        let i = etatGlobal.listeNotes.addNote(note);

        //indexNoteCourant change pour la note fraîchement créée
        etatGlobal.indexNoteCourante = i;

        //idem pour la note
        etatGlobal.noteCourante = note;

        noteListMenuView.displayItem(note);

        let color = document.querySelector("#noteListMenu");
        for (let i = 0; i < etatGlobal.listeNotes.getList().length; i++) {
            color.children[i].classList.remove("note_list_item-selected");
        }
        
        color.children[i].classList.toggle("note_list_item-selected");

        let vueNote = new NoteView(note);
        vueNote.afficher();

        document.querySelector("#form_add_note_title").value = "";
        document.querySelector("#form_add_note_text").value = "contenu de la note";
        
    }

}

let noteEditView = {

    init()
    {
        document.querySelector("#form_add_note_valid").onclick = noteEditView.validateEdit;
    },
    display() {

        let edit = document.querySelector("#noteForm");
        
        if (etatGlobal.noteCourante==undefined)
        {
            let script = document.createElement('script');
            script.innerHTML = "alert(\"Veuillez cliquer sur une note pour pouvoir la modifier.\");";            
            edit.appendChild(script);
        }else{
            
            edit.children[0].value = etatGlobal.noteCourante.titre;
            edit.children[1].value = etatGlobal.noteCourante.contenu;
            edit.classList.remove("create_edit_note-hidden");
            noteEditView.init();
        }


    },
    validateEdit()
    {

        etatGlobal.noteCourante.titre = document.querySelector("#form_add_note_title").value;
        etatGlobal.noteCourante.contenu = document.querySelector("#form_add_note_text").value;
        let list = document.querySelector('#noteListMenu');
        list.children[etatGlobal.indexNoteCourante].innerHTML = `${etatGlobal.noteCourante.titre} ${etatGlobal.noteCourante.date_creation}`;
        etatGlobal.listeNotes.save();

        //document.querySelector("#form_add_note_title").value = "";
        //document.querySelector("#form_add_note_text").value = "";

    }


}

let noteListMenuView = {
    init()
    {
        if (etatGlobal.listeNotes.getList()!=null){
            etatGlobal.listeNotes.getList().forEach( (note) => {
                noteListMenuView.displayItem(note);
            });
        }

        document.querySelector("#del").onclick = this.delItem;
    },
    displayItem(note) 
    {
        let div = document.createElement('div');

        div.innerHTML = `${note.titre} ${note.date_creation}`;
        div.classList.add("note_list_item");
        
        let list = document.querySelector('#noteListMenu');
        list.appendChild(div);

    },
    delItem()
    {
        let del = document.body;
        if (etatGlobal.noteCourante==undefined)
        {
            let script = document.createElement('script');
            script.innerHTML = "alert(\"Veuillez cliquer sur une note pour pouvoir la supprimer.\");";            
            del.appendChild(script);

        }else{
            //suppression de la note à l'index courante
            etatGlobal.listeNotes.suppNote();


            let list = document.querySelector('#noteListMenu');

            //recherche de la note dans la liste des enfants de #noteListMenu
            let a = list.children[etatGlobal.indexNoteCourante];

            //suppression de l'enfant
            list.removeChild(a);

            etatGlobal.indexNoteCourante = undefined;
            etatGlobal.noteCourante = undefined;

            //on sauvegarde le nouvel état
            etatGlobal.listeNotes.save();

            noteFormView.hide();
            document.querySelector("#currentNoteView").classList.add("current_note-hidden");
        }
    }
}

let mainMenuView = {
    init() {
        let docAdd = document.querySelector("#add");
        docAdd.onclick = noteFormView.display;

        let docEdit = document.querySelector("#edit");
        docEdit.onclick = noteEditView.display;

        console.log("liste");
        console.log(etatGlobal.listeNotes.getList());
        document.querySelector("#clear").onclick = etatGlobal.listeNotes.clear;
    }
}

let etatGlobal = {
    noteCourante:undefined,
    listeNotes: null,
    indexNoteCourante : null,
    init() 
    {
        console.log('init app');
        
        etatGlobal.listeNotes = new NoteList();
        etatGlobal.listeNotes.save();
        etatGlobal.listeNotes.load();

        mainMenuView.init();
        noteListMenuView.init();
        
        document.querySelector("#noteListMenu").onclick = function(e) {
            let nodes = e.currentTarget.childNodes;
            for (let i = 0 ; i < nodes.length ; i++){
                nodes[i].classList.remove("note_list_item-selected");
                if (nodes[i] == e.target){
                    etatGlobal.indexNoteCourante = i;
                    let note = etatGlobal.listeNotes.getNoteById(i);
                    etatGlobal.noteCourante = note;
                    e.target.classList.toggle("note_list_item-selected");
                    noteFormView.hide();
                    let noteVue = new NoteView(note);
                    noteVue.afficher();
                }
            }
        };

    }
}

//etatGlobal.init();
window.onload = etatGlobal.init();
