class RadarElement {

    constructor(data, container) {
        this.data = data;
        this.container = container;
    }
}

class Point extends RadarElement {

    constructor(data, container) {
        super(data, container);
    }

    static build(data) {

        let container = document.createElement("div");
        container.className = "radar_point";

        return new Point(data, container);
    }

    setPositionProvider(positionProvider) {
        this.positionProvider = positionProvider;
    }

    setDepthProvider(depthProvider) {
        this.depthProvider = depthProvider;
    }

    redraw() {
        this.container.style.setProperty('--angle', this.positionProvider(this));
        this.container.style.setProperty('--depth', this.depthProvider());
    }
}

class Zone extends RadarElement {

    constructor(data, container) {

        super(data, container);
        this.points = [];

        this.redraw();
    }

    static build(zoneData, segmentData) {

        let container = document.createElement("div");
        container.className = "radar_zone";
        container.style.setProperty('--bg', segmentData.background);

        // Create the references
        return new Zone(zoneData, container);
    }

    addPoint(point) {

        this.points.push(point);

        point.setPositionProvider(point => {

            let index = 1;

            for(let i = 0; i < this.points.length; i++) {
                if(this.points[i] === point) {
                    index = i + 1;
                    break;
                }
            }

            return (this.angleProvider() / (this.points.length + 1)) * index;
        });

        point.setDepthProvider(() => {

            let zoneWidth = this.widthProvider(this);
            let offset = 100 - zoneWidth;

            let randomMin = 0.50;
            let randomMax = 0.80;
            let randomDepth = Math.random() * (randomMax - randomMin) + randomMin;

            console.log("Random: " + randomDepth);
            return zoneWidth * randomDepth + offset;
        })

        this.container.appendChild(point.container);
        this.redraw();
    }

    redraw() {

        this.container.style.setProperty('--value', this.data.value);
        this.points.forEach(point => { point.redraw(); })
    }

    getWidth() { return Number(this.data.value.replaceAll("%", "")); }

    setAngleProvider(provider) {
        this.angleProvider = provider;
    }

    setWidthProvider(provider) {
        this.widthProvider = provider;
    }
}

class Segment extends RadarElement {

    constructor(data, container) {
        super(data, container);
        this.zones = [];
    }

    static build(offset, segmentData, data) {

        let container = document.createElement("div");
        container.className = "radar_segment";
        container.style.setProperty('--offset', offset);
        container.style.setProperty('--bg', segmentData.background);

        let segment = new Segment(segmentData, container);

        data.zones.forEach(zoneData => {
            segment.addZone(Zone.build(zoneData, segmentData));
        });

        return segment;
    }

    addZone(zone) {

        zone.setAngleProvider(() => { return this.data["degrees"]; });

        zone.setWidthProvider(zone => {
            let position = this.zones.indexOf(zone);

            if(this.zones.length !== position + 1) {

                let innerZoneWidth = this.zones[position + 1].getWidth();
                let zoneWidth = zone.getWidth();

                return ((zoneWidth - innerZoneWidth) / zoneWidth) * 100;
            }

            return 100;
        })

        this.zones.push(zone);
        this.container.appendChild(zone.container);
    }

    addPoint(point) {

        this.zones.forEach(zone => {

            if(zone.data.name === point.data["zone"]) {
                zone.addPoint(point);
            }
        })
    }
}

class Radar extends RadarElement {

    constructor(data, container) {
        super(data, container);
        this.segments = [];
    }

    static build(data, container) {

        container.innerHTML = null;

        let radar = this.createRadar(data);
        container.appendChild(radar.container);

        return radar;
    }

    static createRadar(data) {

        let container = document.createElement("div");
        container.className = "radar";

        let radar = new Radar(data, container);

        let offset = 0;

        data.segments.forEach(element => {
            let segment = Segment.build(offset, element, data);
            radar.segments.push(segment);

            container.appendChild(segment.container);

            offset += element["degrees"];
        });

        data.points.forEach(pointData => {
            radar.addPoint(pointData);
        })

        return radar;
    }

    redraw() {

        this.segments.forEach(segment => segment.redraw());
    }

    addPoint(data) {

        let point = Point.build(data);

        this.segments.forEach(segment => {

            if(segment.data.name === data["segment"]) {

                segment.addPoint(point);
            }
        })
    }
}