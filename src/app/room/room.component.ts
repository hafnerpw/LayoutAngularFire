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
  localStream: MediaStream;
  remoteStream: MediaStream;



  private callDoc: AngularFirestoreDocument<any>;


  title = 'n1';
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

  pc: RTCPeerConnection;

  selectedDeviceId: string;
  private partyList: any;
  private answerCandidates: AngularFirestoreCollection<any>;
  private offerCandidates: AngularFirestoreCollection<any>;
  callInput: string;


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelName = params.roomId;
    });
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.pc = new RTCPeerConnection(environment.configuration);
    this.myUserId = codex.guid();

    this.remoteStream = new MediaStream();
    this.pc.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
    };
    this.remoteVideo.nativeElement.srcObject = this.remoteStream;
  }
  constructor(private route: ActivatedRoute, private afs: AngularFirestore) {}

  async connect() {
    // add me to room
    this.callDoc = this.afs.collection('calls').doc();
    this.offerCandidates = this.callDoc.collection('offerCandidates');
    this.answerCandidates = this.callDoc.collection('answerCandidates');

    this.callInput = this.callDoc.ref.id;

    // Get Cancidates for caller, save to db
    this.pc.onicecandidate = event => {
      event.candidate && this.offerCandidates.add(event.candidate.toJSON()); // toJSON nötig ?
    };

    // Create offer
    const offerDescription = await this.pc.createOffer();
    await this.pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await this.callDoc.set({offer});


    // listen for remote answer
    this.callDoc.snapshotChanges().subscribe(changes => {
      const data = changes.payload.data();
      if (!this.pc.currentRemoteDescription && data?.answer){
        const answerDescription = new RTCSessionDescription(data.answer);
        this.pc.setRemoteDescription(answerDescription);
      }
    });

    // Listen for remote ICE candidates
    this.answerCandidates.snapshotChanges().subscribe(snapshot => {
      snapshot.forEach((change) => {
        if (change.type === 'added'){
          const candidate = new RTCIceCandidate(change.payload.doc.data());
          this.pc.addIceCandidate(candidate);
        }
      });
    });

  }


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

    this.getConnectedDevices('videoinput', cameras => {
      this.cameras = cameras;
      console.log('Cameras', this.cameras);
    });

    navigator.mediaDevices.addEventListener('devicechange', event => {
      this.cameras = [];
      this.getConnectedDevices('videoinput', cameras => {
        this.cameras = cameras;
        console.log('Devices Changed');
        this.openCamera().then(r => null);
      });
    });
  }

  getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const filtered = devices.filter(device => device.kind === type);
        callback(filtered);
      });
  }

  async openCamera() {
    try {
      const constraints = {video: {deviceId: this.selectedDeviceId}, audio: {echoCancellation: true}};

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream.getTracks().forEach((track) => {
       this.pc.addTrack(track, this.localStream);
       this.ownVideo.nativeElement.srcObject = this.localStream;

      });

    } catch (error) {
      console.error('Error opening video camera.', error);
    }

  }

  private readNewMessage(val: unknown) {

  }

  addEntry() {
    this.callDoc.collection('partyList').add({user: 'soundso', hausnummer: 20});
  }

  async answerCall() {
    const callId = this.callInput;
    const callDocL = this.afs.collection('calls').doc(callId);
    const offerCandidates = callDocL.collection('offerCandidates');
    const answerCandidates = callDocL.collection('answerCandidates');

    this.pc.onicecandidate = event => {
      event.candidate && this.answerCandidates.add(event.candidate.toJSON()); // json ?
    };

    let callData: any;
    callDocL.get().subscribe(a => {
      callData = a.data();
      this.pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
    });

    let answer: any;
    this.pc.createAnswer().then(answerDescription => {
      this.pc.setLocalDescription(answerDescription);
      answer = {type: answerDescription.type, sdp: answerDescription.sdp};
    }).then(() => {
      callDocL.update({answer});
    });

    offerCandidates.snapshotChanges().subscribe(snapshot => {
      snapshot.forEach((change) => {
        console.log(change);
        if (change.type === 'added'){
          const data = change.payload.doc.data();
          this.pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }
}
