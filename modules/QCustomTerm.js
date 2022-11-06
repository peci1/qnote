var { FileUtils } = ChromeUtils.import("resource://gre/modules/FileUtils.jsm");
var { ExtensionParent } = ChromeUtils.import("resource://gre/modules/ExtensionParent.jsm");
var { QNoteFile } = ChromeUtils.import("resource://qnote/modules/QNoteFile.js");
var { XNoteFile } = ChromeUtils.import("resource://qnote/modules/XNoteFile.js");

var EXPORTED_SYMBOLS = ["QCustomTerm"];

// NOTE:
// We need completely restart TB if CustomTerm code changes
// Currenlty there are no means to remove filter or there is but I'm not aware, please let me know: qnote@dqdp.net
class QCustomTerm {
	constructor(options) {
		this.options = options;
		this.id = options.id;
		this.name = options.name;
		this.needsBody = options.needsBody;
		this.notesRoot = options.notesRoot;
		this.ops = [Ci.nsMsgSearchOp.Contains, Ci.nsMsgSearchOp.DoesntContain, Ci.nsMsgSearchOp.Is, Ci.nsMsgSearchOp.Isnt];
		this.QN = new QNoteFile;
		this.XN = new XNoteFile;
	}
	getEnabled(scope, op) {
		return true;
		//return ops.includes(op);
	}
	// Currently disabled in search dialogs, because can't figure out how to add text box to the filter
	// Probably through XUL or something
	getAvailable(scope, op) {
		return true;
		//return ops.includes(op);
	}
	getAvailableOperators(scope, length) {
		if(length){
			length.value = this.ops.length;
		}

		return this.ops;
	}
	match(msgHdr, searchValue, searchOp) {
		// console.log("match", msgHdr, searchValue, searchOp);
		let note;
		try {
			note = this.QN.load(this.notesRoot, msgHdr.messageId);
			if(!note){
				note = this.XN.load(this.notesRoot, msgHdr.messageId);
			}
		} catch(e) { }

		if(!note){
			return searchOp == Ci.nsMsgSearchOp.DoesntContain;
		}

		let noteText = note.text.toLowerCase();
		let keyw = searchValue.toLowerCase();

		if(searchOp == Ci.nsMsgSearchOp.Contains){
			return !keyw || (noteText.search(keyw) >= 0);
		}

		if(searchOp == Ci.nsMsgSearchOp.DoesntContain){
			return !keyw || (noteText.search(keyw) == -1);
		}

		if(searchOp == Ci.nsMsgSearchOp.Is){
			return noteText == keyw;
		}

		if(searchOp == Ci.nsMsgSearchOp.Isnt){
			return noteText != keyw;
		}
	}
};
