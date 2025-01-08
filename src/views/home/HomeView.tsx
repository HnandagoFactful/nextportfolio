import { Responsive as ResponsiveGridLayout } from "react-grid-layout";

export default function HomeView() {

    return (
        <ResponsiveGridLayout
        className="layout"
        layouts={{
            lg: 
        }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      >
        <div key="1">1</div>
        <div key="2">2</div>
        <div key="3">3</div>
      </ResponsiveGridLayout>
    );
}