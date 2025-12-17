import { Component, createSignal, createResource, For } from 'solid-js';
import { tauriCommands } from '../../lib/api/tauri';
import styles from './ConfigEditor.module.css'; // Assuming you might add CSS

interface ConfigEditorProps {
    bepinexPath: string; // Passed from parent or store
}

const ConfigEditor: Component<ConfigEditorProps> = (props) => {
    const [selectedFile, setSelectedFile] = createSignal<string | null>(null);
    const [fileContent, setFileContent] = createSignal<string>('');
    const [status, setStatus] = createSignal<string>('');

    const [files, { refetch }] = createResource(
        () => props.bepinexPath,
        async (path) => {
            if (!path) return [];
            try {
                return await tauriCommands.listConfigFiles(path);
            } catch (e) {
                console.error("Failed to list config files", e);
                return [];
            }
        }
    );

    const loadFile = async (filename: string) => {
        try {
            const content = await tauriCommands.readConfigFile(props.bepinexPath, filename);
            setSelectedFile(filename);
            setFileContent(content);
            setStatus(`Loaded ${filename}`);
        } catch (e) {
            setStatus(`Error loading ${filename}`);
        }
    };

    const saveFile = async () => {
        const filename = selectedFile();
        if (!filename) return;
        try {
            await tauriCommands.saveConfigFile(props.bepinexPath, filename, fileContent());
            setStatus(`Saved ${filename}`);
        } catch (e) {
            setStatus(`Error saving ${filename}`);
        }
    };

    return (
        <div class="config-editor">
            <h2>Config Editor</h2>
            <div class="editor-layout" style={{ display: 'flex', gap: '20px' }}>
                <div class="file-list" style={{ width: '250px', "border-right": '1px solid #ccc' }}>
                    <h3>Files</h3>
                    <ul>
                        <For each={files()}>
                            {(file) => (
                                <li
                                    onClick={() => loadFile(file)}
                                    style={{
                                        cursor: 'pointer',
                                        "font-weight": selectedFile() === file ? 'bold' : 'normal'
                                    }}
                                >
                                    {file}
                                </li>
                            )}
                        </For>
                    </ul>
                </div>
                <div class="editor-content" style={{ flex: 1 }}>
                    {selectedFile() ? (
                        <>
                            <h3>Editing: {selectedFile()}</h3>
                            <textarea
                                value={fileContent()}
                                onInput={(e) => setFileContent(e.currentTarget.value)}
                                style={{ width: '100%', height: '400px', "font-family": 'monospace' }}
                            />
                            <div class="actions" style={{ "margin-top": '10px' }}>
                                <button onClick={saveFile}>Save Changes</button>
                                <span style={{ "margin-left": '10px' }}>{status()}</span>
                            </div>
                        </>
                    ) : (
                        <p>Select a config file to edit</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigEditor;
