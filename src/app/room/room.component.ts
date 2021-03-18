import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {codex} from './codex';
import {environment} from '../../environments/environment';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from '@angular/fire/firestore';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})


export class RoomComponent implements OnInit, AfterViewInit {

  cameras: MediaDeviceInfo[];
  myUserId: string;
  private callDoc: AngularFirestoreDocument<any>;
  // webRTC Variables
  peerConnection: RTCPeerConnection;
  localStream: MediaStream;
  remoteStream: MediaStream;
  roomDialog = null;
  roomId: string;

  //

  @ViewChild('gameCanvas', {static: true})
  canvas: ElementRef<HTMLCanvasElement>;

  @ViewChild('ownVideo', {static: true})
  ownVideo: ElementRef<HTMLVideoElement>;

  @ViewChild('remote1', {static: true})
  remoteVideo: ElementRef<HTMLVideoElement>;

  private ctx: CanvasRenderingContext2D;
  ctxWidth = 800;
  ctxHeight = 600;
  channelName: string;

  selectedDeviceId: string;
  callInput: string;


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelName = params.roomId;
    });
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.myUserId = codex.guid();

  }
  constructor(private route: ActivatedRoute, private afs: AngularFirestore) {}

  draw(): void {

    this.ctx.font = '100px serif';

    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    let y = this.ctx.canvas.height / 2;
    setInterval(() => {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.fillText('canvas dummy', this.ctx.canvas.width / 2, y + 150);
      this.ctx.fillText('😜😂😍', this.ctx.canvas.width / 2, y);
      y += 2;
      if (y >= this.ctx.canvas.height + 90) {
        y = -90;
      }
    }, 30);

  }

  ngAfterViewInit(): void {
    this.draw();
  }

  async createRoom(): Promise<void> {
    const roomRef = await this.afs.collection('rooms').doc();
    console.log('created RoomRef');
    this.peerConnection = new RTCPeerConnection(environment.configuration);

    this.registerPeerConnectionListener();

    this.localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Code for collecting ICE candidates below
    const callerCandidatesCollection = roomRef.collection('callerCandidates');

    this.peerConnection.addEventListener('icecandidate',  event => {
      if (!event.candidate){
        console.log('got final candidate');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    });

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log('created offer: ', offer);

    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp
      }
    };
    await roomRef.set(roomWithOffer);
    this.roomId = roomRef.ref.id;

    this.channelName = roomRef.ref.id;

    console.log(`New room created with SDP offer. Room ID: ${roomRef.ref.id}`);
    // Code for creating a room above
    this.peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('add a track to the remotestream', track);
        this.remoteStream.addTrack(track);
      });
    });

    roomRef.snapshotChanges().subscribe(async snapshot => {
      if (snapshot.type === 'added') {
        const data = snapshot.payload.data();

        // @ts-ignore
        if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
          // @ts-ignore
          console.log('got remote description', data.answer);
          // @ts-ignore
          const rtcSessionDescription = new RTCSessionDescription(data.answer);
          await this.peerConnection.setRemoteDescription(rtcSessionDescription);
        }
      }
    });
    // Listen for remote ICE candidates below
    roomRef.collection('calleeCandidates').snapshotChanges()
      .subscribe(change => {
      change.forEach(async c => {
        if (c.type === 'added'){
          const data = c.payload.doc.data();
          console.log('Got new remote ICE candidate', JSON.stringify(data));
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  private registerPeerConnectionListener(): void {
    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      console.log(`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
    });
    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.log(`ICE gathering state changed: ${this.peerConnection.connectionState}`);
    });
    this.peerConnection.addEventListener('signalingstatechange', () => {
      console.log(`ICE gathering state changed: ${this.peerConnection.signalingState}`);
    });
    this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.log(`ICE gathering state changed: ${this.peerConnection.iceConnectionState}`);
    });
  }

  async openCamera(): Promise<void>   {
    const stream = await navigator.mediaDevices
      .getUserMedia({video: true, audio: true});
    this.ownVideo.nativeElement.srcObject = stream;
    this.localStream = stream;
    this.remoteStream = new MediaStream();
    this.remoteVideo.nativeElement.srcObject = this.remoteStream;

    console.log('stream', this.remoteVideo.nativeElement.srcObject);
  }
}
