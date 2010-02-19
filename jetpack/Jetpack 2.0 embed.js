
// Save simple, persistent notes in the slidebar.

jetpack.future.import("slideBar");
jetpack.future.import("storage.simple");


// Add our content to the slidebar.
jetpack.slideBar.append({
  onReady: function (slide) {
    // Adds a button for note.  You can click on it to view and edit it.
    function addNoteButton(note) {
      var li = $("<div />", slide.contentDocument);
      li.addClass("noteButton");
      var time = $("<div />", slide.contentDocument);
      time.addClass("noteButtonTime");
      time.text(new Date(note.time).toLocaleString());
      li.append(time);
      var summary = $("<div />", slide.contentDocument);
      summary.addClass("noteButtonSummary");
      summary.text(noteSummary(note));
      li.append(summary);
      li.click(function () showNote(note, li));
      $("#lineList", slide.contentDocument).append(li);
      return li;
    }

    // Makes a summary based on the given note's body.
    function noteSummary(note) {
      return note.body.length > 50 ?
             note.body.substr(0, 50) + "..." :
             note.body;
    }
  },

  width: 300,
  persist: true,

  // This automagically becomes our slidebar content.
  html: <>
    <style><![CDATA[
      body {
        background: #fff;
        color: #222;
        font-family: sans-serif;
        font-size: 10pt;
      }
      h1 {
        font-size: 10pt;
        text-align: center;
      }
	  #logo {
			background: #ffcc33;
			background-image:url('data:image/png;base64,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');
			background-position: center top;
			background-repeat:no-repeat;
			background-attachment: fixed;
			-moz-border-radius: 5px;
			font-weight: bold;
			text-align: center;
			cursor: pointer;
			width: 100%;
			margin-bottom:10px;
			/*background-image:url('http://frankc.net/logo_david_yellow.png');*/
			/*http://www.greywyvern.com/code/php/binary2base64*/
		}
      textarea {
        width: 100%;
height:30px;
      }
      #editArea {
        padding: 1em;
        -moz-border-radius: 5px;
        background: #ccf;
      }
      #noteTime {
        margin: 0;
        font-weight: bold;
      }
      #removeNoteButton {
        color: #833;
        padding-top: 1em;
        font-weight: bold;
        cursor: pointer;
      }
      #newLineButton {
        background: #ffa;
        color: #330;
        margin: 1em 0;
        padding: 0.5em;
        -moz-border-radius: 5px;
        font-weight: bold;
        text-align: center;
        cursor: pointer;
      }
      .noteButton {
        background: #ddd;
        color: #333;
        margin: 1em 0;
        padding: 0.5em;
        -moz-border-radius: 5px;
        cursor: pointer;
      }
      .noteButtonTime {
         font-weight: bold;
      }
    ]]></style>
    <body>
      <div id="logo"><a>-</a></div>
      <div id="newLineButton"><textarea id="title" onclick="javascript:this.value='';" rows="1">Enter title here</textarea>Create new timeline</div>
	  
	  <div id="lineList">
			<div>
				<h1>Lines containing this link </h1>
				<div>
					<span style="float:right">Next</span>
					<span style="float:left">Previous</span>
					<iframe frameborder="0" width="300" height="235" style="float:left;width:300px;height:230px;border:0px solid #808080" src="http://linehive.com/embed/56"></iframe>
				</div>
				<div>
					<span style="float:right">Next</span>
					<span style="float:left">Previous</span>
					<iframe frameborder="0" width="300" height="235" style="float:left;width:300px;height:230px;border:0px solid #808080" src="http://linehive.com/embed/55"></iframe>
				</div>
				<div>4 More...	:LDSKFLDSKJFLKDSJF LDSKFLDSKJFLKDSJF LDSKFLDSKJFLKDSJF LDSKFLDSKJFLKDSJF  </div>
			</div>
	  </div>
    </body>
  </>
});
