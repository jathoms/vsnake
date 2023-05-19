import * as vscode from "vscode";
import { getNonce } from "./getNonce";
import file from "./webview.html";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      // @ts-ignore
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const scriptUri = webview.asWebviewUri(
      // @ts-ignore
      vscode.Uri.joinPath(this._extensionUri, "src", "game.js")
    );

    const otherScriptUri = webview.asWebviewUri(
      // @ts-ignore
      vscode.Uri.joinPath(this._extensionUri, "src", "Snake.js")
    );

    const styleGeneralUri = webview.asWebviewUri(
      // @ts-ignore
      vscode.Uri.joinPath(this._extensionUri, "media", "style.css")
    );
    // const styleMainUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "src", "compiled/sidebar.css")
    // );
    const styleVSCodeUri = webview.asWebviewUri(
      // @ts-ignore
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <!--
        Use a content security policy to only allow loading images from https or from our extension directory,
        and only allow scripts that have a specific nonce.
            -->
          <meta http-equiv="Content-Security-Policy" content="default-src img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleResetUri}" rel="stylesheet">
    <link href="${styleVSCodeUri}" rel="stylesheet">
    <link href="${styleGeneralUri}" rel="stylesheet">
    <script nonce="${nonce}" src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.3.1/p5.js"></script>

    <script nonce="${nonce}">
      const text = document.documentElement.innerHTML;
    </script>
    
    </head>
      <body>
      <div id="game">
        <script nonce="${nonce}" src="${scriptUri}"></script>
        <script nonce="${nonce}" src="${otherScriptUri}"></script>
      </div>
      <div class="slidecontainer">
        <input type="range" min="5" max="30" value="10" class="slider" id="myRange">
        <script>
          document.getElementById("myRange").addEventListener("keydown", function(e) {
            e.preventDefault();
          });
        </script>
      </div>
    </body>
    </html>`;
  }
}
