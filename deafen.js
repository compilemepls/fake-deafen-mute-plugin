/**
 * @name FakeMuteDeafen
 * @author retro
 * @version 0.0.3
 * @description Allows you to appear muted/deafened in Discord while still being able to speak and hear others.
 */

class FakeMuteDeafen {
    constructor() {
        this.originalSend = null;
        this.isPatched = false;
        this.targetWebSocket = null;
    }

    getName() {
        return "Fake Mute & Deafen";
    }

    getDescription() {
        return "Allows you to appear muted/deafened while still being able to speak and hear others. Join a voice channel, mute/deafen yourself, then toggle the plugin.";
    }

    getVersion() {
        return "0.0.3";
    }

    getAuthor() {
        return "retro";
    }

    start() {
        this.patchWebSocket();
        BdApi.UI.showToast("Fake Mute & Deafen activated!", {
            type: "success",
            timeout: 3000
        });
    }

    stop() {
        this.unpatchWebSocket();
        BdApi.UI.showToast("Fake Mute & Deafen stopped!", {
            type: "info",
            timeout: 3000
        });
    }

    patchWebSocket() {
        if (this.isPatched) return;

        this.originalSend = WebSocket.prototype.send;
        const decoder = new TextDecoder("utf-8");
        const encoder = new TextEncoder();
        
        WebSocket.prototype.send = function(data) {
            try {
                // Only process ArrayBuffer data
                if (data instanceof ArrayBuffer) {
                    const decoded = decoder.decode(data);
                    
                    // Only intercept voice state updates (op 4)
                    if (decoded.includes('"op":4') && decoded.includes('"self_deaf":true')) {
                        console.log("[FakeMuteDeafen] Intercepted voice state update");
                        
                        try {
                            const parsed = JSON.parse(decoded);
                            
                            if (parsed.op === 4 && parsed.d && parsed.d.self_deaf === true) {
                                parsed.d.self_mute = false;
                                
                                const modified = JSON.stringify(parsed);
                                data = encoder.encode(modified).buffer;
                                
                                console.log("[FakeMuteDeafen] Modified voice state");
                            }
                        } catch (e) {
                            console.error("[FakeMuteDeafen] Parse error:", e);
                        }
                    }
                }
            } catch (error) {
                console.error("[FakeMuteDeafen] Error:", error);
            }
            return this.originalSend.call(this, data);
        };

        this.isPatched = true;
        console.log("[FakeMuteDeafen] Patched");
    }

    unpatchWebSocket() {
        if (!this.isPatched || !this.originalSend) return;

        WebSocket.prototype.send = this.originalSend;
        this.originalSend = null;
        this.isPatched = false;
        
        console.log("[FakeMuteDeafen] Unpatched");
    }
}

module.exports = FakeMuteDeafen;