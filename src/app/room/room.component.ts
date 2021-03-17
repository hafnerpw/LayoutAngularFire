import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {codex} from "./codex";
import {environment} from "../../environments/environment";
import {AngularFirestore, AngularFirestoreDocument} from "@angular/fire/firestore";

export interface Item { host: string; }


@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})


export class RoomComponent implements OnInit, AfterViewInit {

  cameras: MediaDeviceInfo[];
  myUserId: string;
  ownStream: MediaStream;
  remoteStream: MediaStream;

  private itemDoc: AngularFirestoreDocument<Item>;


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

  peerConnection: RTCPeerConnection;

  selectedDeviceId: string;
  private partyList: any;


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.channelName = params['roomId'];
    });
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.peerConnection = new RTCPeerConnection(environment.configuration);
    this.myUserId = codex.guid();

    this.peerConnection.onicecandidate = event => {
      if( event.candidate){

      }
    }

    this.peerConnection.ontrack = event => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      })
    }
    this.remoteVideo.nativeElement.srcObject = this.remoteStream;
  }
  constructor(private route: ActivatedRoute,private afs: AngularFirestore) {}

  connect() {
    // add me to room
    this.itemDoc = this.afs.doc<Item>('rooms/raum1');

    this.peerConnection.onicecandidate = event => {

    }

    //prepare and send Offer
    this.peerConnection.createOffer().then(offer => {
      this.peerConnection.setLocalDescription(offer);
    }).then(() => {
      let sdpJson = JSON.stringify({sdp: this.peerConnection.localDescription})
      this.itemDoc.collection('partyList')
        .add({userId: this.myUserId, sdp: this.peerConnection.localDescription.sdp, type: this.peerConnection.localDescription.type});
    });

    this.acceptConnections(false);
  }

  acceptConnections(isReceiverContent){
    this.partyList = this.itemDoc.collection('partyList').valueChanges().subscribe(changes => {
      this.partyList = changes.filter(a => a.userId !== this.myUserId) // mich selbst ausgenommen
      // handle new things

    })
  }







  draw(): void {

    this.ctx.font = '100px serif'

    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    let y = this.ctx.canvas.height / 2;
    setInterval(() => {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
      this.ctx.fillText('canvas dummy', this.ctx.canvas.width / 2, y + 150)
      this.ctx.fillText('😜😂😍', this.ctx.canvas.width / 2, y)
      y += 2;
      if (y >= this.ctx.canvas.height + 90) {
        y = -90
      }
    }, 30)

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

       this.ownStream = await navigator.mediaDevices.getUserMedia(constraints);
       this.ownStream.getTracks().forEach((track) =>{
       this.peerConnection.addTrack(track, this.ownStream);
       this.ownVideo.nativeElement.srcObject = this.ownStream

      })

    } catch (error) {
      console.error('Error opening video camera.', error);
    }

  }

  private readNewMessage(val: unknown) {

  }

  addEntry() {
    this.itemDoc.collection('partyList').add({user: 'soundso', hausnummer: 20})
  }
}
