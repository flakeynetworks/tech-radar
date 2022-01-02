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
}

class Zone extends RadarElement {

    constructor(data, container) {
        super(data, container);
    }

    static build(zoneData, segmentData) {

        let container = document.createElement("div");
        container.className = "radar_zone";
        container.style.setProperty('--bg', segmentData.background);
        container.style.setProperty('--value', zoneData.value);

        // Create the references
        return new Zone(zoneData, container);
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
            let zone = Zone.build(zoneData, segmentData);
            segment.zones.push(zone);
            container.appendChild(zone.container);
        });

        return segment;
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

    addPoint(data) {

        let point = Point.build(data);

        this.segments.forEach(segment => {

            if(segment.data.name === data["segment"]) {

                segment.zones.forEach(zone => {

                    if(zone.data.name === data["zone"]) {
                        zone.container.appendChild(point.container);
                    }
                })
            }
        })
    }
}