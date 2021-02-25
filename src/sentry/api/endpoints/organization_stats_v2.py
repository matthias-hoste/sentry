from rest_framework.response import Response
from sentry.api.bases.organization import OrganizationEndpoint
from sentry.api.utils import get_date_range_rollup_from_params

from sentry.snuba import outcomes


class OrganizationStatsEndpointV2(OrganizationEndpoint):
    def get(self, request, organization):
        """
        Retrieve Event Counts for an Organization
        `````````````````````````````````````````

        .. caution::
           This endpoint may change in the future without notice.

        Return a set of points representing a normalized timestamp and the
        number of events seen in the period.

        :pparam string organization_slug: the slug of the organization for
                                          which the stats should be
                                          retrieved.
        :qparam timestamp start: a timestamp to set the start of the query
                                 in seconds since UNIX epoch.
        :qparam timestamp end: a timestamp to set the end of the query
                                 in seconds since UNIX epoch.
        :qparam string rollup: an explicit resolution to search
                                 for (one of ``1hr``, or ``1day``)
        :auth: required
        """
        # group = request.GET.get("group", "organization")
        # if group == "organization":
        #     keys = [organization.id]
        # team_list = Team.objects.get_for_user(organization=organization, user=request.user)

        # do we always want all of the projects in an org? is there any case where we wouldnt?
        # project_list = []
        # for team in team_list:
        #     project_list.extend(Project.objects.get_for_user(team=team, user=request.user))

        start, end, rollup = get_date_range_rollup_from_params(request.GET, "1h", round_range=True)

        data = outcomes.query(
            # fields=["times_seen", "quantity"],
            filters={"org_id": [organization.id]},
            group_by=["category", "project_id", "timestamp"],
            start=start,
            end=end,
            rollup=rollup,
            aggregations=[["sum", "times_seen", "aggregate"]],
        )

        return Response(data)


# def query(fields, conditions, group_by, start, end, rollup):
