export type ConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  public onMessage: (msg: string | ArrayBuffer) => void = () => {};
  public onConnectionStateChange: (state: ConnectionState) => void = () => {};
  public onIceCandidateGatheringComplete: (sdp: string) => void = () => {};

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') return;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    this.peerConnection.onconnectionstatechange = () => {
      this.onConnectionStateChange(this.peerConnection?.connectionState as ConnectionState || 'disconnected');
    };

    this.peerConnection.onicegatheringstatechange = () => {
      if (this.peerConnection?.iceGatheringState === 'complete') {
        this.onIceCandidateGatheringComplete(JSON.stringify(this.peerConnection.localDescription));
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (!event.candidate) {
        this.onIceCandidateGatheringComplete(JSON.stringify(this.peerConnection?.localDescription));
      }
    };

    // When remote peer creates the data channel, we receive it here
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  private setupDataChannel() {
    if (!this.dataChannel) return;
    this.dataChannel.onopen = () => console.log('Data channel is open');
    this.dataChannel.onclose = () => console.log('Data channel closed');
    this.dataChannel.onmessage = (event) => {
      this.onMessage(event.data);
    };
  }

  public async createOffer(): Promise<void> {
    if (!this.peerConnection) return;
    
    // Create the data channel on the offer side
    this.dataChannel = this.peerConnection.createDataChannel('chat');
    this.setupDataChannel();

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    // SDP will be passed through onIceCandidateGatheringComplete once ICE gathering finishes
  }

  public async receiveOfferAndCreateAnswer(offerSdp: string): Promise<void> {
    if (!this.peerConnection) return;
    const offer = JSON.parse(offerSdp);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    // SDP will be passed through onIceCandidateGatheringComplete once ICE gathering finishes
  }

  public async receiveAnswer(answerSdp: string): Promise<void> {
    if (!this.peerConnection) return;
    const answer = JSON.parse(answerSdp);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  public sendMessage(msg: string | ArrayBuffer | Blob) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(msg as any); // Blob is supported in modern browsers
    } else {
      console.warn('Cannot send message, DataChannel not open');
    }
  }

  public close() {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.dataChannel = null;
    this.peerConnection = null;
    this.onConnectionStateChange('closed');
  }
}
